#!/usr/bin/env python3
"""spacelibre-vi GitHub Webhook 接收器。

在本地回环地址监听，由 Caddy 反向代理 https://<域名>/hooks/deploy 到此。
校验 GitHub 的 X-Hub-Signature-256（HMAC-SHA256）后，在 push(main) / tag / release
事件时触发一次部署（默认 /usr/local/sbin/vi-deploy.sh）。

仅使用 Python 标准库，无外部依赖。
环境变量：
  VI_WEBHOOK_SECRET  必填，与 GitHub Webhook 的 Secret 一致
  VI_WEBHOOK_HOST    默认 127.0.0.1
  VI_WEBHOOK_PORT    默认 9100
  VI_BRANCH          默认 main（仅此分支的 push 触发）
  VI_DEPLOY_TAGS     默认 1（refs/tags/* 的 push 也触发）
  VI_DEPLOY_CMD      默认 /usr/local/sbin/vi-deploy.sh
"""
import hashlib
import hmac
import json
import os
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ.get("VI_WEBHOOK_SECRET", "").strip()
HOST = os.environ.get("VI_WEBHOOK_HOST", "127.0.0.1")
PORT = int(os.environ.get("VI_WEBHOOK_PORT", "9100"))
BRANCH = os.environ.get("VI_BRANCH", "main")
DEPLOY_CMD = os.environ.get("VI_DEPLOY_CMD", "/usr/local/sbin/vi-deploy.sh")
DEPLOY_TAGS = os.environ.get("VI_DEPLOY_TAGS", "1").strip().lower() not in ("0", "false", "no", "")
MAX_BODY = 1 << 20  # 1 MiB
DEPLOY_TIMEOUT = 3600

_lock = threading.Lock()


def log(msg):
    sys.stderr.write("[vi-webhook] %s\n" % msg)
    sys.stderr.flush()


def verify_signature(headers, body):
    if not SECRET:
        return True
    sig = headers.get("X-Hub-Signature-256", "")
    if not sig.startswith("sha256="):
        return False
    mac = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest("sha256=" + mac, sig)


def decide(event, payload):
    """返回 (是否部署, 原因)。"""
    if event == "ping":
        return False, "ping"
    if event == "push":
        ref = payload.get("ref", "")
        if ref == "refs/heads/" + BRANCH:
            return True, "push %s" % ref
        if DEPLOY_TAGS and ref.startswith("refs/tags/"):
            return True, "tag %s" % ref
        return False, "ignored ref %s" % ref
    if event == "release":
        action = payload.get("action", "")
        if action == "published":
            return True, "release published"
        return False, "ignored release action %s" % action
    return False, "ignored event %s" % event


def run_deploy(reason):
    if not _lock.acquire(blocking=False):
        log("部署已在进行中，忽略本次触发 (%s)" % reason)
        return

    def worker():
        started = time.time()
        log("开始部署 (%s)" % reason)
        try:
            r = subprocess.run(DEPLOY_CMD, shell=True, capture_output=True,
                               text=True, timeout=DEPLOY_TIMEOUT)
            log("部署结束 exit=%s 用时=%.1fs" % (r.returncode, time.time() - started))
            if r.stdout:
                log("stdout:\n" + r.stdout.rstrip())
            if r.stderr:
                log("stderr:\n" + r.stderr.rstrip())
        except subprocess.TimeoutExpired:
            log("部署超时（%ds），已终止" % DEPLOY_TIMEOUT)
        except Exception as exc:  # noqa: BLE001
            log("部署异常: %r" % exc)
        finally:
            _lock.release()

    threading.Thread(target=worker, daemon=True).start()


class Handler(BaseHTTPRequestHandler):
    server_version = "vi-webhook/1.0"
    protocol_version = "HTTP/1.1"

    def _reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802
        self._reply(405, {"ok": False, "error": "method not allowed"})

    def do_POST(self):  # noqa: N802
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            self._reply(413, {"ok": False, "error": "invalid body size"})
            return

        body = self.rfile.read(length)

        if not verify_signature(self.headers, body):
            log("签名校验失败，来自 %s" % self.client_address[0])
            self._reply(401, {"ok": False, "error": "invalid signature"})
            return

        event = self.headers.get("X-GitHub-Event", "")
        try:
            payload = json.loads(body.decode("utf-8") or "{}")
        except ValueError:
            self._reply(400, {"ok": False, "error": "invalid json"})
            return

        if event == "ping":
            log("收到 ping（zen=%r）" % payload.get("zen"))
            self._reply(200, {"ok": True, "pong": True})
            return

        go, reason = decide(event, payload)
        delivery = self.headers.get("X-GitHub-Delivery", "")
        if go:
            run_deploy("%s delivery=%s" % (reason, delivery))
            self._reply(202, {"ok": True, "deploying": True, "reason": reason})
        else:
            self._reply(200, {"ok": True, "deploying": False, "reason": reason})

    def log_message(self, fmt, *args):
        log("%s - %s" % (self.client_address[0], fmt % args))


def main():
    if not SECRET:
        log("警告：未设置 VI_WEBHOOK_SECRET，将不校验签名（不推荐）")
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    log("监听 http://%s:%d（branch=%s deploy_tags=%s cmd=%s）"
        % (HOST, PORT, BRANCH, DEPLOY_TAGS, DEPLOY_CMD))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
