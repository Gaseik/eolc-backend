#!/bin/bash

# EOLC Backend Docker 部署腳本
# 使用方法: ./deploy-docker.sh [environment]
# 環境選項: dev, staging, production (默認: production)

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 獲取環境參數
ENVIRONMENT=${1:-production}
CONTAINER_NAME="eolc-backend"
IMAGE_NAME="eolc-backend"
NETWORK_NAME="eolc-network"

log_info "🚀 開始部署 EOLC Backend (環境: $ENVIRONMENT)"

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    log_error "Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查環境變數文件
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    log_error "環境變數文件 $ENV_FILE 不存在"
    log_info "請創建 $ENV_FILE 文件或使用正確的環境名稱"
    exit 1
fi

log_info "📋 使用環境變數文件: $ENV_FILE"

# 1. 停止並刪除舊容器
log_info "🛑 停止舊容器..."
if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    docker stop $CONTAINER_NAME 2>/dev/null || true
    log_success "舊容器已停止"
    
    log_info "🗑️ 刪除舊容器..."
    docker rm $CONTAINER_NAME 2>/dev/null || true
    log_success "舊容器已刪除"
else
    log_warning "沒有找到舊容器 $CONTAINER_NAME"
fi

# 2. 刪除舊映像（可選）
read -p "是否刪除舊的 Docker 映像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "🗑️ 刪除舊映像..."
    docker rmi $IMAGE_NAME 2>/dev/null || true
    log_success "舊映像已刪除"
fi

# 3. 創建 Docker 網絡（如果不存在）
log_info "🌐 檢查 Docker 網絡..."
if ! docker network ls --format "table {{.Name}}" | grep -q "^${NETWORK_NAME}$"; then
    log_info "創建 Docker 網絡: $NETWORK_NAME"
    docker network create $NETWORK_NAME
    log_success "Docker 網絡已創建"
else
    log_info "Docker 網絡 $NETWORK_NAME 已存在"
fi

# 4. 構建新映像
log_info "🔨 構建新的 Docker 映像..."
docker build -t $IMAGE_NAME:$ENVIRONMENT .
if [ $? -eq 0 ]; then
    log_success "Docker 映像構建成功"
else
    log_error "Docker 映像構建失敗"
    exit 1
fi

# 5. 運行新容器
log_info "🚀 啟動新容器..."
docker run -d \
    --name $CONTAINER_NAME \
    --network $NETWORK_NAME \
    --restart unless-stopped \
    --env-file $ENV_FILE \
    -p 8080:8080 \
    $IMAGE_NAME:$ENVIRONMENT

if [ $? -eq 0 ]; then
    log_success "新容器啟動成功"
else
    log_error "新容器啟動失敗"
    exit 1
fi

# 6. 等待服務啟動
log_info "⏳ 等待服務啟動..."
sleep 5

# 7. 檢查容器狀態
log_info "🔍 檢查容器狀態..."
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$CONTAINER_NAME.*Up"; then
    log_success "容器運行正常"
else
    log_error "容器啟動失敗"
    log_info "查看容器日誌:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# 8. 健康檢查
log_info "🏥 執行健康檢查..."
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=3

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_success "健康檢查通過"
        break
    else
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            log_error "健康檢查失敗"
            log_info "查看容器日誌:"
            docker logs $CONTAINER_NAME
            exit 1
        else
            log_warning "健康檢查失敗，重試中... ($i/$HEALTH_CHECK_RETRIES)"
            sleep $HEALTH_CHECK_DELAY
        fi
    fi
done

# 9. 顯示部署信息
log_success "🎉 部署完成！"
echo ""
echo "📊 部署信息:"
echo "  容器名稱: $CONTAINER_NAME"
echo "  映像標籤: $IMAGE_NAME:$ENVIRONMENT"
echo "  端口: 8080"
echo "  環境: $ENVIRONMENT"
echo "  網絡: $NETWORK_NAME"
echo ""
echo "🔧 常用命令:"
echo "  查看日誌: docker logs -f $CONTAINER_NAME"
echo "  停止服務: docker stop $CONTAINER_NAME"
echo "  重啟服務: docker restart $CONTAINER_NAME"
echo "  進入容器: docker exec -it $CONTAINER_NAME sh"
echo ""
echo "🌐 服務地址: http://localhost:8080"
echo "🏥 健康檢查: http://localhost:8080/health" 