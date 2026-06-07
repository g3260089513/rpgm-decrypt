@echo off
chcp 65001 >nul
title 图片解密工具 — RPG Maker MZ

cd /d "%~dp0"

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo ⏳ 首次运行，正在安装依赖...
    call npm install
    echo.
)

:: 启动 Vite 开发服务器并打开浏览器
echo 🚀 启动应用...
start "" http://localhost:5173
call npx vite --host 127.0.0.1 --port 5173
pause
