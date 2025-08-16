#!/bin/bash

# EOLC Backend 快速部署腳本
# 使用方法: ./deploy.sh [environment]

echo "🚀 EOLC Backend 快速部署"
echo "================================"

# 檢查部署腳本是否存在
if [ ! -f "deploy-docker.sh" ]; then
    echo "❌ 找不到 deploy-docker.sh 腳本"
    exit 1
fi

# 設置腳本權限
chmod +x deploy-docker.sh

# 獲取環境參數
ENVIRONMENT=${1:-production}

echo "📋 部署環境: $ENVIRONMENT"
echo ""

# 執行 Docker 部署
./deploy-docker.sh $ENVIRONMENT