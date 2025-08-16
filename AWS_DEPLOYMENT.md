# 🚀 AWS 部署指南

## 📋 概述

這個指南會告訴你在 AWS 服務器上如何部署 EOLC Backend。

## 🔧 準備工作

### 1. 在 AWS 服務器上安裝必要軟件
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安裝 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 Git
sudo apt install git -y
```

### 2. 克隆專案
```bash
# 克隆你的專案
git clone <your-repository-url>
cd eolc-backend
```

### 3. 創建環境變數文件
```bash
# 創建生產環境變數文件
cp .env.example .env.production
nano .env.production
```

### 環境變數範例 (.env.production)
```env
# 服務器配置
NODE_ENV=production
PORT=8080

# 數據庫配置 (使用你的 MongoDB 連接字符串)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eolc

# JWT 配置 (請更改這些密鑰)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS 配置 (你的前端域名)
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk

# 日誌配置
LOG_LEVEL=info
```

## 🚀 部署流程

### 第一次部署
```bash
# 1. 設置腳本權限
chmod +x deploy-aws.sh

# 2. 執行部署
./deploy-aws.sh
```

### 後續更新部署
每次你更新程式碼後，在 AWS 服務器上執行：

```bash
# 進入專案目錄
cd eolc-backend

# 執行部署腳本
./deploy-aws.sh
```

## 📋 部署腳本會自動執行：

1. **拉取最新程式碼** - `git pull origin main`
2. **安裝依賴** - `npm install`
3. **停止舊容器** - `docker-compose down`
4. **構建新映像** - `docker-compose build --no-cache`
5. **啟動新容器** - `docker-compose up -d`
6. **健康檢查** - 檢查服務是否正常運行

## 🔍 檢查部署狀態

### 查看容器狀態
```bash
docker-compose ps
```

### 查看日誌
```bash
# 查看實時日誌
docker-compose logs -f

# 查看最近的日誌
docker-compose logs --tail=50
```

### 健康檢查
```bash
# 檢查 API 是否正常
curl http://localhost:8080/health

# 或者檢查外部 IP
curl http://your-aws-ip:8080/health
```

## 🔧 常用管理命令

### 停止服務
```bash
docker-compose down
```

### 重啟服務
```bash
docker-compose restart
```

### 重新構建並啟動
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 查看資源使用情況
```bash
docker stats
```

## 🔐 安全設置

### 1. 防火牆設置
```bash
# 只開放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (如果需要)
sudo ufw allow 443   # HTTPS (如果需要)
sudo ufw allow 8080  # 你的應用端口
sudo ufw enable
```

### 2. 設置反向代理 (可選)
如果你想要使用域名訪問，可以設置 Nginx：

```bash
# 安裝 Nginx
sudo apt install nginx -y

# 創建 Nginx 配置
sudo nano /etc/nginx/sites-available/eolc-backend
```

Nginx 配置範例：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 啟用站點
sudo ln -s /etc/nginx/sites-available/eolc-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔍 故障排除

### 常見問題

1. **Docker 未運行**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **端口被佔用**
   ```bash
   # 查看端口使用情況
   sudo lsof -i :8080
   
   # 停止佔用端口的進程
   sudo kill -9 <PID>
   ```

3. **容器啟動失敗**
   ```bash
   # 查看詳細日誌
   docker-compose logs
   
   # 檢查環境變數
   cat .env.production
   ```

4. **權限問題**
   ```bash
   # 將用戶加入 docker 組
   sudo usermod -aG docker $USER
   # 重新登入或執行
   newgrp docker
   ```

### 完全重置
```bash
# 停止所有容器
docker-compose down

# 刪除所有映像
docker system prune -a -f

# 重新部署
./deploy-aws.sh
```

## 📞 支持

如果遇到問題：
1. 檢查 Docker 是否正在運行
2. 檢查 `.env.production` 文件是否正確
3. 查看容器日誌：`docker-compose logs`
4. 檢查防火牆設置
5. 確認端口是否被其他服務佔用 