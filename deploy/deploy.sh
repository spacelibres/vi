#!/usr/bin/env bash
#
# spacelibre-vi —— 服务端一键部署脚本（在 VPS 上以 root 运行）
#
# 它会把 https://github.com/spacelibres/vi 部署为一个静态站点，并配置 Caddy
# 将 https://vi.spacelibre.cn (443) 指向该站点。脚本是幂等的：可反复运行用于更新。
#
# 典型用法（在 VPS 上）：
#   DOMAIN=vi.spacelibre.cn bash deploy.sh
# 或直接从本地机器一键执行：
#   ssh root@<vps> 'bash -s' < deploy/deploy.sh
#
# 可通过环境变量覆盖的行为见下方 CFG 段。
#
set -Eeuo pipefail

# ---------------------------------------------------------------------------
# CFG（可用环境变量覆盖）
# ---------------------------------------------------------------------------
DOMAIN="${DOMAIN:-vi.spacelibre.cn}"
REPO_URL="${REPO_URL:-https://github.com/spacelibres/vi.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
APP_DIR="${APP_DIR:-/srv/spacelibre-vi}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
BUILD_ZIP="${BUILD_ZIP:-1}"        # 1=生成 spacelibre-svg-assets.zip（首页“下载全部 SVG”依赖它）
SETUP_FIREWALL="${SETUP_FIREWALL:-1}"  # 1=尝试放行 80/443
SKIP_CLONE="${SKIP_CLONE:-0}"      # 1=不克隆/拉取，直接使用已有 APP_DIR（本地 rsync 上传模式）
FORCE="${FORCE:-0}"                # 1=允许清理非本脚本创建的非空 APP_DIR
ACME_EMAIL="${ACME_EMAIL:-}"       # 可选：Let's Encrypt 通知邮箱

# —— GitHub Webhook 自动部署（可选）——
WEBHOOK_ENABLE="${WEBHOOK_ENABLE:-0}"        # 1=安装 webhook 接收器并自动部署
WEBHOOK_PATH="${WEBHOOK_PATH:-/hooks/deploy}"  # 对外路径（经 Caddy 反代）
WEBHOOK_HOST="${WEBHOOK_HOST:-127.0.0.1}"      # 接收器监听地址（仅回环）
WEBHOOK_PORT="${WEBHOOK_PORT:-9100}"          # 接收器监听端口
WEBHOOK_SECRET="${WEBHOOK_SECRET:-}"          # 留空则自动生成

BEGIN_MARK="# >>> spacelibre-vi managed block (do not edit) >>>"
END_MARK="# <<< spacelibre-vi managed block <<<"

# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------
c_reset=$'\033[0m'; c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_yellow=$'\033[1;33m'; c_red=$'\033[1;31m'
log()  { printf '%s[%s]%s %s\n' "$c_blue"   "vi-deploy" "$c_reset" "$*"; }
ok()   { printf '%s[ ok ]%s %s\n' "$c_green"  "" "$*"; }
warn() { printf '%s[warn]%s %s\n' "$c_yellow" "" "$*" >&2; }
die()  { printf '%s[fail]%s %s\n' "$c_red"    "" "$*" >&2; exit 1; }

require_root() {
  [ "$(id -u)" -eq 0 ] || die "请以 root 运行（sudo bash deploy.sh）。"
}

# 检测包管理器
PKG=""
detect_pkg() {
  if   command -v apt-get >/dev/null 2>&1; then PKG=apt
  elif command -v dnf     >/dev/null 2>&1; then PKG=dnf
  elif command -v yum     >/dev/null 2>&1; then PKG=yum
  elif command -v zypper  >/dev/null 2>&1; then PKG=zypper
  elif command -v apk     >/dev/null 2>&1; then PKG=apk
  else PKG=""; fi
}

pkg_install() {
  # $@ = 包名
  [ -n "$PKG" ] || { warn "未识别包管理器，请手动安装：$*"; return 0; }
  log "安装依赖：$* （$PKG）"
  case "$PKG" in
    apt)    DEBIAN_FRONTEND=noninteractive apt-get update -y >/dev/null 2>&1 || true
            DEBIAN_FRONTEND=noninteractive apt-get install -y "$@" >/dev/null ;;
    dnf)    dnf install -y "$@" >/dev/null ;;
    yum)    yum install -y "$@" >/dev/null ;;
    zypper) zypper --non-interactive install -y "$@" >/dev/null ;;
    apk)    apk add --no-cache "$@" >/dev/null ;;
  esac
}

# ---------------------------------------------------------------------------
# 1. 依赖
# ---------------------------------------------------------------------------
ensure_deps() {
  detect_pkg
  local need=()
  command -v curl    >/dev/null 2>&1 || need+=(curl)
  command -v git     >/dev/null 2>&1 || need+=(git)
  command -v python3 >/dev/null 2>&1 || need+=(python3)
  [ ${#need[@]} -eq 0 ] || pkg_install "${need[@]}"
  [ "${SKIP_CLONE}" = "1" ] || command -v git >/dev/null 2>&1 || die "缺少 git，无法克隆仓库（或用 SKIP_CLONE=1 上传本地文件）。"
  [ "${BUILD_ZIP}" = "1" ] && { command -v python3 >/dev/null 2>&1 || { warn "缺少 python3，跳过 zip 打包。"; BUILD_ZIP=0; }; }
  ok "依赖检查完成"
}

# ---------------------------------------------------------------------------
# 2. Caddy 是否可用
# ---------------------------------------------------------------------------
CADDY_BIN=""
ensure_caddy() {
  CADDY_BIN="$(command -v caddy || true)"
  [ -n "$CADDY_BIN" ] && [ -x "$CADDY_BIN" ] && { ok "Caddy: $CADDY_BIN"; return 0; }
  [ -x /usr/bin/caddy ] && { CADDY_BIN=/usr/bin/caddy; ok "Caddy: $CADDY_BIN"; return 0; }

  warn "未检测到 caddy，尝试通过官方源安装……"
  case "$PKG" in
    apt)
      DEBIAN_FRONTEND=noninteractive apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg >/dev/null
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
      DEBIAN_FRONTEND=noninteractive apt-get update -y >/dev/null
      DEBIAN_FRONTEND=noninteractive apt-get install -y caddy >/dev/null
      ;;
    dnf|yum)
      "$PKG" install -y 'dnf-command(copr)' >/dev/null 2>&1 || true
      "$PKG" copr enable -y @caddy/caddy >/dev/null 2>&1 || true
      "$PKG" install -y caddy >/dev/null
      ;;
    *)
      die "请先手动安装 Caddy（https://caddyserver.com/docs/install），再重新运行本脚本。"
      ;;
  esac
  CADDY_BIN="$(command -v caddy || true)"
  [ -n "$CADDY_BIN" ] || die "Caddy 安装失败，请手动安装后重试。"
  ok "Caddy 已安装：$CADDY_BIN"
}

# ---------------------------------------------------------------------------
# 3. 部署站点文件
# ---------------------------------------------------------------------------
deploy_files() {
  mkdir -p "$(dirname "$APP_DIR")"

  if [ "$SKIP_CLONE" = "1" ]; then
    [ -f "$APP_DIR/index.html" ] || die "SKIP_CLONE=1 但 $APP_DIR/index.html 不存在，请先上传站点文件。"
    ok "使用已上传的站点文件：$APP_DIR"
  elif [ -d "$APP_DIR/.git" ]; then
    log "更新已有仓库：$APP_DIR （分支 $REPO_BRANCH）"
    git -C "$APP_DIR" remote set-url origin "$REPO_URL" || true
    git -C "$APP_DIR" fetch --depth 1 --prune origin "$REPO_BRANCH"
    git -C "$APP_DIR" reset --hard FETCH_HEAD
    git -C "$APP_DIR" clean -fdx -e artifacts -e '*.zip' >/dev/null 2>&1 || true
  else
    if [ -e "$APP_DIR" ] && [ -n "$(ls -A "$APP_DIR" 2>/dev/null || true)" ]; then
      if [ "$FORCE" = "1" ]; then
        warn "FORCE=1：清理已存在的 $APP_DIR"
        rm -rf "$APP_DIR"
      else
        die "$APP_DIR 已存在且非 git 仓库。请改用 FORCE=1 覆盖，或设置 APP_DIR 到别处。"
      fi
    else
      rm -rf "$APP_DIR"
    fi
    log "克隆仓库：$REPO_URL （分支 $REPO_BRANCH）"
    if ! git clone --depth 1 --single-branch --branch "$REPO_BRANCH" "$REPO_URL" "$APP_DIR" 2>/dev/null; then
      warn "分支 $REPO_BRANCH 克隆失败，尝试默认分支……"
      git clone --depth 1 --single-branch "$REPO_URL" "$APP_DIR"
    fi
  fi

  [ -f "$APP_DIR/index.html" ] || die "$APP_DIR/index.html 不存在——请检查 REPO_URL / REPO_BRANCH 是否正确。"
  ok "站点文件就绪：$APP_DIR"
}

build_zip() {
  [ "$BUILD_ZIP" = "1" ] || { log "跳过 zip 打包"; return 0; }
  if [ -f "$APP_DIR/scripts/build_artifacts.py" ]; then
    log "生成 spacelibre-svg-assets.zip"
    ( cd "$APP_DIR" && python3 scripts/build_artifacts.py >/dev/null )
    ok "SVG 打包完成"
  else
    warn "未找到 scripts/build_artifacts.py，跳过打包。"
  fi
}

set_perms() {
  chown -R root:root "$APP_DIR" 2>/dev/null || true
  find "$APP_DIR" -type d -exec chmod 0755 {} + 2>/dev/null || true
  find "$APP_DIR" -type f -exec chmod 0644 {} + 2>/dev/null || true
  # 允许 caddy 用户读取（file_server 需要）
  chmod -R a+rX "$APP_DIR" 2>/dev/null || true
  # SELinux 环境（RHEL 系）：给出可用上下文
  if command -v restorecon >/dev/null 2>&1; then restorecon -R "$APP_DIR" >/dev/null 2>&1 || true; fi
  ok "权限已设置（caddy 可读）"
}

# ---------------------------------------------------------------------------
# 4. 写入 Caddy 配置（保留其它站点，例如 tile1.spacexway.com）
# ---------------------------------------------------------------------------
write_caddy_config() {
  [ -d "$(dirname "$CADDYFILE")" ] || mkdir -p "$(dirname "$CADDYFILE")"

  local ts backup tmp
  ts="$(date +%Y%m%d-%H%M%S)"
  if [ -f "$CADDYFILE" ]; then
    backup="${CADDYFILE}.bak.${ts}"
    cp -a "$CADDYFILE" "$backup"
    log "已备份现有 Caddyfile → $backup"
  else
    backup=""
    touch "$CADDYFILE"
  fi

  tmp="$(mktemp)"
  # 删除旧的托管块（幂等），保留其余内容
  if [ -s "$CADDYFILE" ]; then
    awk -v b="$BEGIN_MARK" -v e="$END_MARK" '
      $0==b {skip=1; next}
      $0==e {skip=0; next}
      skip!=1 {print}
    ' "$CADDYFILE" > "$tmp"
  fi

  # 追加全新托管块
  {
    printf '\n%s\n' "$BEGIN_MARK"
    printf '%s {\n' "$DOMAIN"
    printf '\troot * %s\n' "$APP_DIR"
    printf '\tencode zstd gzip\n'
    printf '\n'
    if [ "$WEBHOOK_ENABLE" = "1" ]; then
      printf '\t# GitHub Webhook → 本地接收器（仅回环）\n'
      printf '\t@viwebhook path %s\n' "$WEBHOOK_PATH"
      printf '\thandle @viwebhook {\n'
      printf '\t\treverse_proxy %s:%s\n' "$WEBHOOK_HOST" "$WEBHOOK_PORT"
      printf '\t}\n'
      printf '\n'
    fi
    printf '\tfile_server {\n'
    printf '\t\thide .git\n'
    printf '\t}\n'
    printf '\theader {\n'
    printf '\t\tStrict-Transport-Security "max-age=31536000; includeSubDomains"\n'
    printf '\t\tX-Content-Type-Options "nosniff"\n'
    printf '\t\tReferrer-Policy "strict-origin-when-cross-origin"\n'
    printf '\t}\n'
    printf '}\n'
    printf '%s\n' "$END_MARK"
  } >> "$tmp"

  install -m 0644 "$tmp" "$CADDYFILE"
  rm -f "$tmp"

  # 格式化（失败不致命）
  "$CADDY_BIN" fmt --overwrite "$CADDYFILE" >/dev/null 2>&1 || true

  # 校验
  log "校验 Caddy 配置"
  if ! "$CADDY_BIN" validate --config "$CADDYFILE" --adapter caddyfile >/dev/null; then
    warn "Caddy 配置校验失败，回滚。"
    if [ -n "$backup" ] && [ -f "$backup" ]; then cp -a "$backup" "$CADDYFILE"; fi
    "$CADDY_BIN" validate --config "$CADDYFILE" --adapter caddyfile || true
    die "Caddy 配置无效，已恢复原文件。"
  fi
  ok "Caddy 配置校验通过"
}

reload_caddy() {
  log "重载 Caddy"
  if systemctl reload caddy >/dev/null 2>&1; then
    ok "systemctl reload caddy 成功"
  elif systemctl restart caddy >/dev/null 2>&1; then
    ok "systemctl restart caddy 成功"
  elif "$CADDY_BIN" reload --config "$CADDYFILE" --adapter caddyfile >/dev/null 2>&1; then
    ok "caddy reload 成功"
  else
    die "无法重载 Caddy，请检查：systemctl status caddy"
  fi
}

# ---------------------------------------------------------------------------
# 5. 防火墙 & DNS 预检（仅提示）
# ---------------------------------------------------------------------------
open_firewall() {
  [ "$SETUP_FIREWALL" = "1" ] || return 0
  if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -qi '^Status: active'; then
    ufw allow 80/tcp  >/dev/null 2>&1 || true
    ufw allow 443/tcp >/dev/null 2>&1 || true
    ok "ufw 已放行 80/443"
  fi
  if command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state >/dev/null 2>&1; then
    firewall-cmd --permanent --add-service=http  >/dev/null 2>&1 || true
    firewall-cmd --permanent --add-service=https >/dev/null 2>&1 || true
    firewall-cmd --reload >/dev/null 2>&1 || true
    ok "firewalld 已放行 http/https"
  fi
}

preflight_dns() {
  local pub ipv4
  pub="$(curl -fsS --max-time 8 https://api.ipify.org 2>/dev/null || curl -fsS --max-time 8 https://ifconfig.me 2>/dev/null || true)"
  ipv4="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk 'NR==1{print $1}' || true)"

  if [ -z "$ipv4" ]; then
    warn "无法解析 $DOMAIN 的 A 记录。请到 DNS 服务商处添加："
    warn "    A  $DOMAIN  ->  ${pub:-<本机公网IP>}"
  elif [ -n "$pub" ] && [ "$ipv4" != "$pub" ]; then
    warn "$DOMAIN 解析到 $ipv4，但本机公网 IP 是 $pub。若使用了 CDN/反代可忽略，否则请修正 DNS。"
  else
    ok "DNS 预检：$DOMAIN → ${ipv4}"
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn '( sport = :443 or sport = :80 )' 2>/dev/null | tail -n +2 | sed 's/^/    /' || true
  fi
}

# ---------------------------------------------------------------------------
# 6. GitHub Webhook 接收器（可选，自动发现新版本并同步）
# ---------------------------------------------------------------------------
install_webhook() {
  [ "$WEBHOOK_ENABLE" = "1" ] || { log "未启用 webhook（设置 WEBHOOK_ENABLE=1 可启用自动部署）"; return 0; }

  local src="$APP_DIR/deploy/vi-webhook.py"
  [ -f "$src" ] || die "找不到 $src，无法安装 webhook 接收器（请确认仓库已更新到含 deploy/ 的版本）。"

  # 密钥：留空则随机生成
  if [ -z "$WEBHOOK_SECRET" ]; then
    if command -v openssl >/dev/null 2>&1; then
      WEBHOOK_SECRET="$(openssl rand -hex 32)"
    else
      WEBHOOK_SECRET="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
    fi
  fi

  install -d -m 0755 /usr/local/bin /usr/local/sbin
  install -m 0755 "$src" /usr/local/bin/vi-webhook.py

  # 稳定版部署脚本（供 webhook 调用）；仅在语法校验通过时替换，避免坏提交锁死自动部署
  if [ -f "$APP_DIR/deploy/deploy.sh" ] && bash -n "$APP_DIR/deploy/deploy.sh" 2>/dev/null; then
    install -m 0755 "$APP_DIR/deploy/deploy.sh" /usr/local/sbin/vi-deploy.sh
  else
    warn "仓库中的 deploy.sh 语法校验未通过，保留现有 /usr/local/sbin/vi-deploy.sh"
  fi

  # 部署配置（供稳定版脚本以无参数方式运行）
  cat > /etc/default/vi-deploy <<EOF
DOMAIN=$DOMAIN
REPO_URL=$REPO_URL
REPO_BRANCH=$REPO_BRANCH
APP_DIR=$APP_DIR
CADDYFILE=$CADDYFILE
BUILD_ZIP=$BUILD_ZIP
SETUP_FIREWALL=$SETUP_FIREWALL
WEBHOOK_ENABLE=1
WEBHOOK_PATH=$WEBHOOK_PATH
WEBHOOK_HOST=$WEBHOOK_HOST
WEBHOOK_PORT=$WEBHOOK_PORT
EOF
  chmod 0644 /etc/default/vi-deploy

  # 接收器配置（含密钥，仅 root 可读）
  cat > /etc/vi-webhook.env <<EOF
VI_WEBHOOK_SECRET=$WEBHOOK_SECRET
VI_WEBHOOK_HOST=$WEBHOOK_HOST
VI_WEBHOOK_PORT=$WEBHOOK_PORT
VI_BRANCH=$REPO_BRANCH
VI_DEPLOY_TAGS=1
VI_DEPLOY_CMD=/usr/local/sbin/vi-deploy.sh
EOF
  chmod 0600 /etc/vi-webhook.env

  # systemd 单元（KillMode=process：重启服务不会中断正在进行的部署子进程）
  cat > /etc/systemd/system/vi-webhook.service <<'EOF'
[Unit]
Description=spacelibre-vi GitHub webhook receiver
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=/etc/default/vi-deploy
EnvironmentFile=/etc/vi-webhook.env
ExecStart=/usr/bin/env python3 /usr/local/bin/vi-webhook.py
Restart=on-failure
RestartSec=3
KillMode=process
User=root

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable vi-webhook >/dev/null 2>&1 || true
  systemctl restart vi-webhook

  sleep 1
  if systemctl is-active vi-webhook >/dev/null 2>&1; then
    ok "webhook 接收器运行中（$WEBHOOK_HOST:$WEBHOOK_PORT）"
  else
    warn "webhook 服务未运行，请检查：systemctl status vi-webhook"
  fi

  ok "GitHub Webhook 地址：https://$DOMAIN$WEBHOOK_PATH"
  printf '   事件：push / release    Content-Type: application/json\n'
  printf '   Secret：%s\n' "$WEBHOOK_SECRET"
  printf '   （本脚本可用 GH_TOKEN 自动创建该 webhook，见 deploy/README.md）\n'
}

# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
main() {
  log "spacelibre-vi 部署开始"
  log "域名=$DOMAIN  仓库=$REPO_URL  分支=$REPO_BRANCH  目录=$APP_DIR"
  require_root

  # 串行化：避免与 webhook 触发的部署并发执行
  if command -v flock >/dev/null 2>&1; then
    [ -d /var/lock ] || mkdir -p /var/lock
    exec 9>/var/lock/vi-deploy.lock
    flock -n 9 || die "已有部署正在进行（/var/lock/vi-deploy.lock），请稍后重试。"
  fi

  ensure_deps
  ensure_caddy
  deploy_files
  build_zip
  set_perms
  write_caddy_config
  reload_caddy
  install_webhook
  open_firewall
  preflight_dns

  printf '\n'
  ok "部署完成 🚀"
  printf '   站点：https://%s/\n' "$DOMAIN"
  printf '   根目录：%s\n' "$APP_DIR"
  printf '   Caddy：%s\n' "$CADDYFILE"
  printf '   说明：Caddy 会自动申请 Let'\''s Encrypt 证书并监听 443（HTTP/1.1、HTTP/2、HTTP/3）。\n'
  printf '   首次签发需数秒至一分钟；如浏览器报证书错误，请稍候重试并确认 DNS 已生效。\n'
}

main "$@"
