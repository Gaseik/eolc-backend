#!/bin/bash

# 部署腳本
echo "開始部署 EOLC Backend..."

# 建立 Docker 映像
echo "建立 Docker 映像..."
sudo docker build -t eolc-backend .

# 停止舊的容器
echo "停止舊的容器..."
sudo docker-compose down

# 啟動新的容器
echo "啟動新的容器..."
sudo docker-compose up -d

echo "部署完成！"
echo "API 文件: http://your-ec2-ip:8080/api-docs" 

