#!/bin/bash

# 生產環境 CORS 測試腳本
# 使用方法: ./test-production-cors.sh

echo "🧪 測試生產環境 CORS 配置"
echo "================================"

# 設置變數
API_URL="https://api-eolc.muldertech.co.uk"
FRONTEND_ORIGIN="https://dev-eolc.muldertech.co.uk"

echo "📍 API URL: $API_URL"
echo "📍 Frontend Origin: $FRONTEND_ORIGIN"
echo ""

# 測試 1: OPTIONS 預檢請求
echo "1️⃣ 測試 OPTIONS 預檢請求..."
curl -s -X OPTIONS "$API_URL/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /dev/null

echo ""

# 測試 2: 實際 POST 請求
echo "2️⃣ 測試實際 POST 請求..."
curl -s -X POST "$API_URL/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /dev/null

echo ""

# 測試 3: 統計 API 請求
echo "3️⃣ 測試統計 API 請求..."
curl -s -X GET "$API_URL/statistics/orders" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Cookie: token=test-token" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /dev/null

echo ""
echo "✅ CORS 測試完成！"
echo ""
echo "📋 檢查清單："
echo "- 如果所有請求都返回 200 或 204 狀態碼，CORS 配置正常"
echo "- 如果返回 CORS 錯誤，請檢查服務器配置"
echo "- 如果返回 404，請確認 API 端點正確" 