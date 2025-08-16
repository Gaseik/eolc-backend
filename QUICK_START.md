# 🚀 快速開始指南

## 克隆專案後的第一步

### 1. 運行自動設置腳本
```bash
./setup.sh
```

這個腳本會自動：
- ✅ 安裝所有依賴
- ✅ 創建 `.env` 和 `.env.production` 文件
- ✅ 構建專案
- ✅ 設置腳本權限

### 2. 配置環境變數
編輯 `.env` 文件，設置必要的配置：

```env
# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/eolc

# JWT 配置（請更改這些密鑰）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### 3. 啟動服務

#### 本地開發
```bash
npm run dev
```

#### Docker 部署
```bash
docker-compose up -d
```

### 4. 測試 API
```bash
# 測試基本連接
curl http://localhost:8080/health

# 測試用戶登入
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"enduser@test.com","password":"password123"}'
```

## 📋 常用命令

```bash
# 開發模式
npm run dev

# 構建專案
npm run build

# 運行測試
npm test

# Docker 部署
docker-compose up -d

# 查看 Docker 日誌
docker-compose logs -f app

# 停止 Docker 服務
docker-compose down
```

## 🔧 故障排除

### 常見問題

1. **構建失敗**
   ```bash
   npm run build
   # 檢查錯誤信息並修復
   ```

2. **MongoDB 連接失敗**
   - 確保 MongoDB 正在運行
   - 檢查 `MONGODB_URI` 配置

3. **CORS 錯誤**
   - 檢查 `.env` 中的 CORS 配置
   - 確認前端域名在允許列表中

4. **Docker 問題**
   ```bash
   # 重新構建 Docker 映像
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 📖 更多信息

- 完整文檔：`README.md`
- 部署檢查清單：`deploy-checklist.md`
- 生產環境測試：`./test-production-cors.sh`

## 🆘 需要幫助？

1. 檢查 `README.md` 中的完整文檔
2. 查看 `deploy-checklist.md` 中的部署指南
3. 運行測試腳本檢查配置：`./test-production-cors.sh` 