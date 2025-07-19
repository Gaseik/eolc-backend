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

# 設定環境變數
ENV NODE_ENV=production
ENV MONGO_URI=mongodb://localhost:27017/eolc
ENV PORT=8080

# 編譯 TypeScript
RUN npm run build

# 檢查編譯結果
RUN echo "=== 檢查 dist 目錄 ===" && ls -la dist/
RUN echo "=== 檢查 server.js ===" && ls -la dist/server.js
RUN echo "=== 檢查編譯的檔案 ===" && find dist -name "*.js" | head -10

# 暴露 port 8080
EXPOSE 8080

# 直接啟動應用
CMD ["node", "dist/server.js"] 