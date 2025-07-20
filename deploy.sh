#!/bin/bash

set -e

echo "==== 1. 拉取最新程式碼 (Pull latest code) ===="
git pull

echo "==== 2. 安裝缺少的 devDependencies (Install missing devDependencies) ===="
npm install --save-dev @types/nodemailer

echo "==== 3. 關閉舊容器 (Stop old containers) ===="
docker-compose down

echo "==== 4. 重新建構 Docker image (Rebuild Docker images) ===="
docker-compose build --no-cache

echo "==== 5. 背景啟動服務 (Start services in background) ===="
docker-compose up -d

echo "==== 6. 查看服務狀態 (Show service status) ===="
docker-compose ps

echo "==== 部署完成！(Deploy finished!) ===="