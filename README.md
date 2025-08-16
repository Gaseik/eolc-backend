# EOLC Backend API

End-of-Life Compliance (EOLC) 後端 API 服務

## 🚀 快速開始

### 1. 克隆專案
```bash
git clone <your-repository-url>
cd eolc-backend
```

### 2. 環境設置

#### 方法一：本地開發
```bash
# 安裝依賴
npm install

# 創建環境變數文件
cp .env.example .env
# 編輯 .env 文件，設置必要的環境變數

# 構建專案
npm run build

# 啟動開發服務器
npm run dev
```

#### 方法二：Docker 部署
```bash
# 創建生產環境變數文件
cp .env.example .env.production
# 編輯 .env.production 文件

# 使用 Docker Compose 啟動
docker-compose up -d

# 或使用 Docker 直接構建
docker build -t eolc-backend .
docker run -p 8080:8080 --env-file .env.production eolc-backend
```

## 📋 環境變數配置

創建 `.env` 或 `.env.production` 文件：

```env
# 服務器配置
NODE_ENV=production
PORT=8080

# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/eolc
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eolc

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# CORS 配置（可選）
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk

# 其他配置
LOG_LEVEL=info
```

## 🐳 Docker 部署

### 本地 Docker 測試
```bash
# 構建映像
docker build -t eolc-backend .

# 運行容器
docker run -p 8080:8080 --env-file .env.production eolc-backend
```

### 生產環境部署
```bash
# 使用 Docker Compose
docker-compose up -d

# 查看日誌
docker-compose logs -f app

# 停止服務
docker-compose down
```

## 🧪 API 測試

### 1. 基本連接測試
```bash
curl http://localhost:8080/health
```

### 2. 用戶登入測試
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"enduser@test.com","password":"password123"}'
```

### 3. CORS 測試（生產環境）
```bash
# 使用提供的測試腳本
./test-production-cors.sh
```

## 📊 主要 API 端點

### 認證
- `POST /auth/login` - 用戶登入
- `POST /auth/register` - 用戶註冊
- `GET /auth/check` - 檢查認證狀態
- `POST /auth/refresh` - 刷新 JWT Token

### 訂單管理
- `GET /orders` - 獲取訂單列表
- `POST /orders` - 創建新訂單
- `GET /orders/:id` - 獲取單一訂單
- `PUT /orders/:id` - 更新訂單
- `PATCH /orders/:id/update-quantity` - 更新訂單數量
- `DELETE /orders/:id` - 刪除訂單

### 統計數據
- `GET /statistics/orders` - 獲取訂單統計數據

### 組織管理
- `GET /organizations` - 獲取組織列表
- `POST /organizations` - 創建組織
- `GET /organizations/:id` - 獲取組織詳情

### 用戶管理
- `GET /users` - 獲取用戶列表
- `POST /users/invite` - 邀請用戶
- `PUT /users/:id` - 更新用戶信息

## 🔧 開發工具

### 腳本命令
```bash
# 開發模式
npm run dev

# 構建專案
npm run build

# 運行測試
npm test

# 代碼檢查
npm run lint

# 格式化代碼
npm run format
```

### 測試腳本
```bash
# 測試 CORS 配置
./test-production-cors.sh

# 測試 API 端點
node test-simple-api.js
```

## 🚀 部署到 AWS

### 1. 準備部署
```bash
# 構建專案
npm run build

# 檢查構建結果
ls -la dist/
```

### 2. 上傳到 AWS
```bash
# 使用提供的部署檢查清單
cat deploy-checklist.md

# 運行部署腳本
./deploy.sh
```

### 3. 驗證部署
```bash
# 測試生產環境 CORS
./test-production-cors.sh

# 檢查服務狀態
curl https://api-eolc.muldertech.co.uk/health
```

## 📝 項目結構

```
eolc-backend/
├── src/
│   ├── controllers/     # 控制器邏輯
│   ├── models/         # 數據模型
│   ├── routes/         # 路由定義
│   ├── middleware/     # 中間件
│   ├── utils/          # 工具函數
│   └── app.ts          # 應用程序入口
├── dist/               # 編譯後的文件
├── tests/              # 測試文件
├── Dockerfile          # Docker 配置
├── docker-compose.yml  # Docker Compose 配置
├── package.json        # 項目依賴
└── README.md           # 項目文檔
```

## 🔍 故障排除

### 常見問題

1. **CORS 錯誤**
   - 檢查 `.env` 中的 CORS 配置
   - 確認前端域名在允許列表中

2. **數據庫連接錯誤**
   - 檢查 `MONGODB_URI` 配置
   - 確認數據庫服務正在運行

3. **JWT 錯誤**
   - 檢查 `JWT_SECRET` 配置
   - 確認 Token 格式正確

### 日誌查看
```bash
# Docker 日誌
docker-compose logs -f app

# 本地開發日誌
npm run dev
```

## 📞 支持

如有問題，請檢查：
1. 部署檢查清單：`deploy-checklist.md`
2. 測試腳本：`test-production-cors.sh`
3. 項目文檔：`README.md`

## 📄 許可證

[你的許可證信息] 
