# AWS 生產環境部署檢查清單

## 🚀 部署前檢查

### 1. CORS 配置確認
- [ ] 確認 `src/app.ts` 中的 CORS 配置包含生產域名
- [ ] 確認允許的域名列表：
  - `https://dev-eolc.muldertech.co.uk`
  - `https://api-eolc.muldertech.co.uk`
  - `https://eolc.muldertech.co.uk`

### 2. 環境變數檢查
- [ ] 確認 `.env` 文件包含正確的生產環境配置
- [ ] 確認 JWT_SECRET 已設置
- [ ] 確認 MONGODB_URI 指向生產數據庫
- [ ] 確認 PORT 設置為正確的端口

### 3. 構建檢查
- [ ] 運行 `npm run build` 確認無編譯錯誤
- [ ] 確認 `dist/` 目錄包含所有編譯後的文件

## 🔧 AWS 部署步驟

### 1. 上傳代碼到 AWS
```bash
# 構建項目
npm run build

# 上傳到 AWS EC2 或 ECS
# 確保包含以下文件：
# - dist/ 目錄
# - package.json
# - package-lock.json
# - .env (生產環境配置)
```

### 2. 安裝依賴
```bash
npm install --production
```

### 3. 啟動服務
```bash
# 使用 PM2 或其他進程管理器
pm2 start dist/server.js --name "eolc-backend"

# 或直接啟動
NODE_ENV=production node dist/server.js
```

## 🧪 部署後測試

### 1. CORS 測試
```bash
# 測試預檢請求
curl -X OPTIONS "https://api-eolc.muldertech.co.uk/auth/login" \
  -H "Origin: https://dev-eolc.muldertech.co.uk" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# 測試實際登入請求
curl -X POST "https://api-eolc.muldertech.co.uk/auth/login" \
  -H "Origin: https://dev-eolc.muldertech.co.uk" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

### 2. API 端點測試
```bash
# 測試統計 API
curl -X GET "https://api-eolc.muldertech.co.uk/statistics/orders" \
  -H "Origin: https://dev-eolc.muldertech.co.uk" \
  -H "Cookie: token=your-token-here" \
  -v
```

## 🔍 常見問題排查

### 1. CORS 錯誤
- 檢查 AWS 安全組是否允許正確的端口
- 檢查負載均衡器配置
- 確認域名 DNS 解析正確

### 2. 連接問題
- 檢查 EC2 實例安全組
- 確認 VPC 配置
- 檢查網絡 ACL 設置

### 3. 性能問題
- 啟用 PM2 集群模式
- 配置 Nginx 反向代理
- 設置適當的緩存策略

## 📝 監控和日誌

### 1. 日誌配置
```bash
# PM2 日誌
pm2 logs eolc-backend

# 應用日誌
tail -f /var/log/eolc-backend/app.log
```

### 2. 監控指標
- API 響應時間
- 錯誤率
- CORS 請求統計
- 內存和 CPU 使用率 