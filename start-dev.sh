#!/bin/bash
set -e
cd /Users/dengzijie/Documents/MyProject

# 先清理旧进程
lsof -ti :8787 | xargs kill 2>/dev/null || true
lsof -ti :5173 | xargs kill 2>/dev/null || true
sleep 1

echo "🚀 启动后端..."
node api/src/server.js &
API_PID=$!
sleep 2

if kill -0 $API_PID 2>/dev/null; then
  echo "✅ 后端已启动 (PID $API_PID)"
else
  echo "❌ 后端启动失败！"
  exit 1
fi

echo "🚀 启动前端..."
python3 -m http.server 5173 &
FRONT_PID=$!
sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 后端 API : http://localhost:8787"
echo " 网页前端 : http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 按 Ctrl+C 停止所有服务"
echo ""

trap "kill $API_PID $FRONT_PID 2>/dev/null; echo '已停止'" INT TERM
wait
