#!/bin/bash

# EOLC Backend Docker Compose 部署腳本
# 使用方法: ./deploy-compose.sh [environment]

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

log_info "🚀 開始 Docker Compose 部署 (環境: $ENVIRONMENT)"

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    log_error "Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查 docker-compose.yml 是否存在
if [ ! -f "docker-compose.yml" ]; then
    log_error "找不到 docker-compose.yml 文件"
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
docker-compose down 2>/dev/null || true
log_success "舊容器已停止並刪除"

# 2. 清理舊映像（可選）
read -p "是否清理舊的 Docker 映像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "🧹 清理舊映像..."
    docker-compose down --rmi all 2>/dev/null || true
    docker system prune -f
    log_success "舊映像已清理"
fi

# 3. 構建新映像
log_info "🔨 構建新的 Docker 映像..."
docker-compose build --no-cache
if [ $? -eq 0 ]; then
    log_success "Docker 映像構建成功"
else
    log_error "Docker 映像構建失敗"
    exit 1
fi

# 4. 啟動新容器
log_info "🚀 啟動新容器..."
docker-compose up -d
if [ $? -eq 0 ]; then
    log_success "新容器啟動成功"
else
    log_error "新容器啟動失敗"
    exit 1
fi

# 5. 等待服務啟動
log_info "⏳ 等待服務啟動..."
sleep 10

# 6. 檢查容器狀態
log_info "🔍 檢查容器狀態..."
docker-compose ps

# 檢查是否有容器運行失敗
if docker-compose ps | grep -q "Exit"; then
    log_error "有容器運行失敗"
    log_info "查看容器日誌:"
    docker-compose logs
    exit 1
fi

# 7. 健康檢查
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
            docker-compose logs
            exit 1
        else
            log_warning "健康檢查失敗，重試中... ($i/$HEALTH_CHECK_RETRIES)"
            sleep $HEALTH_CHECK_DELAY
        fi
    fi
done

# 8. 顯示部署信息
log_success "🎉 部署完成！"
echo ""
echo "📊 部署信息:"
echo "  環境: $ENVIRONMENT"
echo "  端口: 8080"
echo "  網絡: eolc-backend_default"
echo ""
echo "🔧 常用命令:"
echo "  查看日誌: docker-compose logs -f"
echo "  停止服務: docker-compose down"
echo "  重啟服務: docker-compose restart"
echo "  查看狀態: docker-compose ps"
echo "  進入容器: docker-compose exec app sh"
echo ""
echo "🌐 服務地址: http://localhost:8080"
echo "🏥 健康檢查: http://localhost:8080/health" 