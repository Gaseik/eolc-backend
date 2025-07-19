# 使用 Node.js 18 作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴
RUN npm ci

# 複製原始碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 檢查編譯結果
RUN ls -la dist/

# 暴露 port 8080
EXPOSE 8080

# 直接啟動應用，不依賴 package.json
CMD ["node", "dist/server.js"] 