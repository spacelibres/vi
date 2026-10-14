#!/usr/bin/env bash
#
# spacelibre-vi —— 本地一键部署（在你的电脑上运行，自动 SSH 到 VPS 执行）
#
# 两种内容来源：
#   MODE=github （默认）  在 VPS 上从 GitHub 克隆/更新仓库
#   MODE=local            把当前本地目录打包上传到 VPS（适合仓库私有或改动未推送时）
#
# 用法：
#   VPS_PASSWORD='服务器密码' bash deploy/one-click.sh
#   VPS_PASSWORD='服务器密码' MODE=local bash deploy/one-click.sh
#
# 也可不设密码，脚本会回退到交互式 ssh（手动输入密码）。
# 密码仅经环境变量传入，绝不写入文件。
#
set -Eeuo pipefail

# ---------------------------------------------------------------------------
# 配置（可用环境变量覆盖）
# ---------------------------------------------------------------------------
VPS_HOST="${VPS_HOST:-176.122.165.41}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
DOMAIN="${DOMAIN:-vi.spacelibre.cn}"
REPO_URL="${REPO_URL:-https://github.com/spacelibres/vi.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
APP_DIR="${APP_DIR:-/srv/spacelibre-vi}"
MODE="${MODE:-github}"            # github | local
BUILD_ZIP="${BUILD_ZIP:-1}"
SETUP_FIREWALL="${SETUP_FIREWALL:-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SH="$SCRIPT_DIR/deploy.sh"

c_reset=$'\033[0m'; c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_red=$'\033[1;31m'
log() { printf '%s[%s]%s %s\n' "$c_blue" "vi-local" "$c_reset" "$*"; }
ok()  { printf '%s[ ok ]%s %s\n' "$c_green" "" "$*"; }
die() { printf '%s[fail]%s %s\n' "$c_red" "" "$*" >&2; exit 1; }

[ -f "$DEPLOY_SH" ] || die "找不到 $DEPLOY_SH（请与 deploy.sh 放在同一目录）。"
command -v ssh >/dev/null 2>&1 || die "本机缺少 ssh 客户端。"

# ---------------------------------------------------------------------------
# 构造 ssh（如提供密码则用 sshpass，密码经 SSHPASS 环境变量传递）
# ---------------------------------------------------------------------------
SSH=(ssh -p "$VPS_PORT" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30)
if [ -n "${VPS_PASSWORD:-}" ]; then
  if command -v sshpass >/dev/null 2>&1; then
    export SSHPASS="$VPS_PASSWORD"
    SSH=(sshpass -e "${SSH[@]}")
  else
    die "检测到 VPS_PASSWORD 但本机未安装 sshpass。请安装 sshpass，或不设密码改用交互式输入。"
  fi
fi
TARGET="${VPS_USER}@${VPS_HOST}"

# 远端环境变量（用 printf %q 安全转义）
REMOTE_ENV="DOMAIN=$(printf %q "$DOMAIN") REPO_URL=$(printf %q "$REPO_URL") REPO_BRANCH=$(printf %q "$REPO_BRANCH") APP_DIR=$(printf %q "$APP_DIR") BUILD_ZIP=$(printf %q "$BUILD_ZIP") SETUP_FIREWALL=$(printf %q "$SETUP_FIREWALL") SKIP_CLONE=0"

log "目标：$TARGET:$VPS_PORT  域名=$DOMAIN  模式=$MODE"

# ---------------------------------------------------------------------------
# 连通性 & 权限预检
# ---------------------------------------------------------------------------
log "检查 SSH 连通性"
"${SSH[@]}" -o ConnectTimeout=10 "$TARGET" 'echo connected' >/dev/null \
  || die "无法连接到 $TARGET。请确认网络、端口与凭据。"
ok "SSH 连接正常"

if [ "$MODE" = "local" ]; then
  # 上传本地目录（排除版本控制/依赖/构建产物）
  log "打包并上传本地目录 → $APP_DIR"
  tar czf - \
    --exclude='./.git' \
    --exclude='./node_modules' \
    --exclude='./artifacts' \
    --exclude='./deploy' \
    --exclude='*.zip' \
    -C "$SCRIPT_DIR/.." . \
  | "${SSH[@]}" "$TARGET" "mkdir -p $(printf %q "$APP_DIR") && tar xzf - -C $(printf %q "$APP_DIR") --overwrite" \
  || die "上传失败。"
  ok "上传完成"
  REMOTE_ENV="${REMOTE_ENV} SKIP_CLONE=1"
else
  log "将由 VPS 从 GitHub 克隆/更新仓库"
fi

# ---------------------------------------------------------------------------
# 执行服务端安装脚本
# ---------------------------------------------------------------------------
log "在 VPS 上执行安装脚本"
if ! "${SSH[@]}" "$TARGET" "env ${REMOTE_ENV} bash -s" < "$DEPLOY_SH"; then
  die "远端安装失败，请查看上方日志。"
fi

ok "全部完成 ✅"
echo "  访问：https://${DOMAIN}/"
echo "  提醒：确保 DNS 的 A 记录已将 ${DOMAIN} 指向 ${VPS_HOST}。"
