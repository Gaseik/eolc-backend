#!/bin/bash

# EOLC Backend AWS 部署腳本
# 使用方法: ./deploy-aws.sh

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

log_info "🚀 開始 AWS 部署 EOLC Backend"

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    log_error "Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查環境變數文件
if [ ! -f ".env.production" ]; then
    log_error "環境變數文件 .env.production 不存在"
    log_info "請創建 .env.production 文件"
    exit 1
fi

log_info "📋 使用環境變數文件: .env.production"

# 1. 拉取最新程式碼
log_info "📥 拉取最新程式碼..."
git pull origin main
log_success "程式碼更新完成"

# 2. 安裝依賴
log_info "📦 安裝依賴..."
npm install
log_success "依賴安裝完成"

# 3. 停止並刪除舊容器
log_info "🛑 停止舊容器..."
docker-compose down 2>/dev/null || true
log_success "舊容器已停止並刪除"

# 4. 構建新映像
log_info "🔨 構建新的 Docker 映像..."
docker-compose build --no-cache
if [ $? -eq 0 ]; then
    log_success "Docker 映像構建成功"
else
    log_error "Docker 映像構建失敗"
    exit 1
fi

# 5. 啟動新容器
log_info "🚀 啟動新容器..."
docker-compose up -d
if [ $? -eq 0 ]; then
    log_success "新容器啟動成功"
else
    log_error "新容器啟動失敗"
    exit 1
fi

# 6. 等待服務啟動
log_info "⏳ 等待服務啟動..."
sleep 10

# 7. 檢查容器狀態
log_info "🔍 檢查容器狀態..."
docker-compose ps

# 檢查是否有容器運行失敗
if docker-compose ps | grep -q "Exit"; then
    log_error "有容器運行失敗"
    log_info "查看容器日誌:"
    docker-compose logs
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
            docker-compose logs
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
echo "  容器名稱: eolc-backend"
echo "  端口: 8080"
echo "  環境: production"
echo ""
echo "🔧 常用命令:"
echo "  查看日誌: docker-compose logs -f"
echo "  停止服務: docker-compose down"
echo "  重啟服務: docker-compose restart"
echo "  查看狀態: docker-compose ps"
echo ""
echo "🌐 服務地址: http://localhost:8080"
echo "🏥 健康檢查: http://localhost:8080/health" 