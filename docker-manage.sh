#!/bin/bash

# EOLC Backend Docker 管理腳本
# 使用方法: ./docker-manage.sh [command] [environment]
# 命令選項: start, stop, restart, logs, status, shell, clean

set -e

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

# 獲取參數
COMMAND=${1:-help}
ENVIRONMENT=${2:-production}
CONTAINER_NAME="eolc-backend"

# 顯示幫助信息
show_help() {
    echo "🚀 EOLC Backend Docker 管理腳本"
    echo "================================"
    echo ""
    echo "使用方法: ./docker-manage.sh [command] [environment]"
    echo ""
    echo "命令選項:"
    echo "  start     - 啟動服務"
    echo "  stop      - 停止服務"
    echo "  restart   - 重啟服務"
    echo "  logs      - 查看日誌"
    echo "  status    - 查看狀態"
    echo "  shell     - 進入容器"
    echo "  clean     - 清理容器和映像"
    echo "  health    - 健康檢查"
    echo "  help      - 顯示幫助"
    echo ""
    echo "環境選項:"
    echo "  dev, staging, production (默認: production)"
    echo ""
    echo "示例:"
    echo "  ./docker-manage.sh start production"
    echo "  ./docker-manage.sh logs dev"
    echo "  ./docker-manage.sh clean"
}

# 檢查 Docker 是否運行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker 未運行，請先啟動 Docker"
        exit 1
    fi
}

# 啟動服務
start_service() {
    log_info "🚀 啟動 EOLC Backend 服務..."
    
    # 檢查環境變數文件
    ENV_FILE=".env.$ENVIRONMENT"
    if [ ! -f "$ENV_FILE" ]; then
        log_error "環境變數文件 $ENV_FILE 不存在"
        exit 1
    fi
    
    # 使用 docker-compose 啟動
    docker-compose up -d
    log_success "服務啟動成功"
    
    # 等待服務啟動
    sleep 5
    
    # 檢查狀態
    docker-compose ps
}

# 停止服務
stop_service() {
    log_info "🛑 停止 EOLC Backend 服務..."
    docker-compose down
    log_success "服務已停止"
}

# 重啟服務
restart_service() {
    log_info "🔄 重啟 EOLC Backend 服務..."
    docker-compose restart
    log_success "服務重啟成功"
    
    # 等待服務啟動
    sleep 5
    
    # 檢查狀態
    docker-compose ps
}

# 查看日誌
show_logs() {
    log_info "📋 顯示 EOLC Backend 日誌..."
    docker-compose logs -f
}

# 查看狀態
show_status() {
    log_info "📊 EOLC Backend 服務狀態..."
    echo ""
    docker-compose ps
    echo ""
    
    # 顯示容器詳細信息
    log_info "容器詳細信息:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
}

# 進入容器
enter_shell() {
    log_info "🐚 進入 EOLC Backend 容器..."
    docker-compose exec app sh
}

# 清理容器和映像
clean_docker() {
    log_warning "🧹 清理 Docker 資源..."
    
    read -p "確定要清理所有容器和映像嗎？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "停止並刪除容器..."
        docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
        
        log_info "清理未使用的映像..."
        docker system prune -a -f
        
        log_info "清理未使用的卷..."
        docker volume prune -f
        
        log_success "清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 健康檢查
health_check() {
    log_info "🏥 執行健康檢查..."
    
    # 檢查容器是否運行
    if ! docker-compose ps | grep -q "Up"; then
        log_error "容器未運行"
        exit 1
    fi
    
    # 執行健康檢查
    HEALTH_CHECK_RETRIES=3
    HEALTH_CHECK_DELAY=2
    
    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            log_success "健康檢查通過 ✅"
            echo "🌐 服務地址: http://localhost:8080"
            echo "🏥 健康檢查: http://localhost:8080/health"
            break
        else
            if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
                log_error "健康檢查失敗 ❌"
                log_info "查看容器日誌:"
                docker-compose logs --tail=20
                exit 1
            else
                log_warning "健康檢查失敗，重試中... ($i/$HEALTH_CHECK_RETRIES)"
                sleep $HEALTH_CHECK_DELAY
            fi
        fi
    done
}

# 主邏輯
case $COMMAND in
    start)
        check_docker
        start_service
        ;;
    stop)
        check_docker
        stop_service
        ;;
    restart)
        check_docker
        restart_service
        ;;
    logs)
        check_docker
        show_logs
        ;;
    status)
        check_docker
        show_status
        ;;
    shell)
        check_docker
        enter_shell
        ;;
    clean)
        check_docker
        clean_docker
        ;;
    health)
        check_docker
        health_check
        ;;
    help|*)
        show_help
        ;;
esac 