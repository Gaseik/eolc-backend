# 🐳 Docker 部署指南

## 📋 概述

這個專案提供了完整的 Docker 部署機制，包含停止舊版本、刪除舊容器、構建新版本並部署的功能。

## 🚀 快速部署

### 方法一：使用快速部署腳本（推薦）
```bash
# 部署到生產環境
./deploy.sh production

# 部署到開發環境
./deploy.sh dev

# 部署到測試環境
./deploy.sh staging
```

### 方法二：使用 Docker 直接部署
```bash
# 使用 Docker 直接部署
./deploy-docker.sh production

# 使用 Docker Compose 部署
./deploy-compose.sh production
```

## 🔧 Docker 管理命令

### 查看所有可用命令
```bash
./docker-manage.sh help
```

### 基本操作
```bash
# 啟動服務
./docker-manage.sh start production

# 停止服務
./docker-manage.sh stop

# 重啟服務
./docker-manage.sh restart

# 查看狀態
./docker-manage.sh status

# 查看日誌
./docker-manage.sh logs

# 健康檢查
./docker-manage.sh health
```

### 進階操作
```bash
# 進入容器
./docker-manage.sh shell

# 清理容器和映像
./docker-manage.sh clean
```

## 📁 環境變數配置

### 創建環境變數文件
```bash
# 生產環境
cp .env.example .env.production
nano .env.production

# 開發環境
cp .env.example .env.dev
nano .env.dev

# 測試環境
cp .env.example .env.staging
nano .env.staging
```

### 環境變數範例
```env
# 服務器配置
NODE_ENV=production
PORT=8080

# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/eolc

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# CORS 配置
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk
```

## 🔄 部署流程

### 完整部署流程
1. **停止舊容器** - 自動停止並刪除舊的容器
2. **清理舊映像** - 可選：刪除舊的 Docker 映像
3. **構建新映像** - 使用最新的程式碼構建新的 Docker 映像
4. **啟動新容器** - 使用新的映像啟動容器
5. **健康檢查** - 自動檢查服務是否正常運行
6. **部署完成** - 顯示部署信息和常用命令

### 部署腳本功能
- ✅ 自動停止舊容器
- ✅ 自動刪除舊容器
- ✅ 可選清理舊映像
- ✅ 構建新映像
- ✅ 啟動新容器
- ✅ 健康檢查
- ✅ 錯誤處理
- ✅ 彩色日誌輸出
- ✅ 部署狀態報告

## 🧪 測試部署

### 本地測試
```bash
# 部署到本地
./deploy-docker.sh dev

# 測試 API
curl http://localhost:8080/health

# 測試 CORS
./test-production-cors.sh
```

### 生產環境測試
```bash
# 部署到生產環境
./deploy-docker.sh production

# 健康檢查
./docker-manage.sh health

# 查看日誌
./docker-manage.sh logs
```

## 🔍 故障排除

### 常見問題

1. **Docker 未運行**
   ```bash
   # 啟動 Docker
   sudo systemctl start docker
   # 或
   open -a Docker
   ```

2. **環境變數文件不存在**
   ```bash
   # 創建環境變數文件
   cp .env.example .env.production
   nano .env.production
   ```

3. **端口被佔用**
   ```bash
   # 查看端口使用情況
   lsof -i :8080
   
   # 停止佔用端口的進程
   sudo kill -9 <PID>
   ```

4. **容器啟動失敗**
   ```bash
   # 查看容器日誌
   ./docker-manage.sh logs
   
   # 查看容器狀態
   ./docker-manage.sh status
   ```

### 清理和重置
```bash
# 完全清理
./docker-manage.sh clean

# 重新部署
./deploy-docker.sh production
```

## 📊 監控和維護

### 查看服務狀態
```bash
# 查看容器狀態
./docker-manage.sh status

# 查看實時日誌
./docker-manage.sh logs

# 健康檢查
./docker-manage.sh health
```

### 性能監控
```bash
# 查看容器資源使用情況
docker stats

# 查看系統資源
docker system df
```

## 🔐 安全注意事項

1. **環境變數安全**
   - 不要在程式碼中硬編碼敏感信息
   - 使用強密碼和密鑰
   - 定期更換 JWT 密鑰

2. **容器安全**
   - 定期更新基礎映像
   - 使用非 root 用戶運行容器
   - 限制容器權限

3. **網絡安全**
   - 配置適當的 CORS 策略
   - 使用 HTTPS 在生產環境
   - 限制端口訪問

## 📞 支持

如有問題，請檢查：
1. Docker 是否正在運行
2. 環境變數文件是否正確配置
3. 端口是否被其他服務佔用
4. 查看容器日誌獲取詳細錯誤信息

## 🎯 最佳實踐

1. **版本控制**
   - 使用 Git 標籤標記發布版本
   - 保持部署腳本與程式碼同步

2. **備份策略**
   - 定期備份數據庫
   - 備份環境變數文件

3. **監控策略**
   - 設置自動健康檢查
   - 監控容器資源使用情況
   - 設置日誌輪轉 