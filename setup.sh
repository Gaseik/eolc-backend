#!/bin/bash

# EOLC Backend 快速設置腳本
# 使用方法: ./setup.sh

echo "🚀 EOLC Backend 快速設置"
echo "================================"

# 檢查 Node.js 版本
echo "📋 檢查 Node.js 版本..."
node_version=$(node --version)
echo "Node.js 版本: $node_version"

# 檢查 npm 版本
npm_version=$(npm --version)
echo "npm 版本: $npm_version"

# 安裝依賴
echo ""
echo "📦 安裝項目依賴..."
npm install

# 創建環境變數文件
echo ""
echo "⚙️ 設置環境變數..."
if [ ! -f .env ]; then
    echo "創建 .env 文件..."
    cat > .env << EOF
# ===========================================
# EOLC Backend 環境變數配置
# ===========================================

# 服務器配置
NODE_ENV=development
PORT=8080

# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/eolc

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk

# 日誌配置
LOG_LEVEL=info

# 安全配置
BCRYPT_ROUNDS=12
COOKIE_SECRET=your-cookie-secret-change-this-in-production

# 其他配置
DISABLE_HELMET=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ .env 文件已創建"
else
    echo "⚠️  .env 文件已存在，跳過創建"
fi

# 創建生產環境變數文件
if [ ! -f .env.production ]; then
    echo "創建 .env.production 文件..."
    cat > .env.production << EOF
# ===========================================
# EOLC Backend 生產環境變數配置
# ===========================================

# 服務器配置
NODE_ENV=production
PORT=8080

# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/eolc

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk

# 日誌配置
LOG_LEVEL=info

# 安全配置
BCRYPT_ROUNDS=12
COOKIE_SECRET=your-cookie-secret-change-this-in-production

# 其他配置
DISABLE_HELMET=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ .env.production 文件已創建"
else
    echo "⚠️  .env.production 文件已存在，跳過創建"
fi

# 構建專案
echo ""
echo "🔨 構建專案..."
npm run build

# 檢查構建結果
if [ -f "dist/server.js" ]; then
    echo "✅ 構建成功！"
else
    echo "❌ 構建失敗，請檢查錯誤信息"
    exit 1
fi

# 設置腳本權限
echo ""
echo "🔧 設置腳本權限..."
chmod +x test-production-cors.sh
chmod +x setup.sh

echo ""
echo "🎉 設置完成！"
echo ""
echo "📋 下一步："
echo "1. 編輯 .env 文件，設置正確的環境變數"
echo "2. 確保 MongoDB 正在運行"
echo "3. 運行 'npm run dev' 啟動開發服務器"
echo "4. 或運行 'docker-compose up -d' 使用 Docker 部署"
echo ""
echo "�� 更多信息請查看 README.md" 