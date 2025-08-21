# EOLC Backend - Mongoose Schema 定義文檔

## 📋 目錄
1. [User Schema](#user-schema)
2. [Organization Schema](#organization-schema)
3. [Model Schema](#model-schema)
4. [Order Schema](#order-schema)
5. [OrderReport Schema](#orderreport-schema)
6. [ModelReport Schema](#modelreport-schema)

---

## 👤 User Schema

### 基本信息
- **集合名稱**: `users`
- **描述**: 用戶帳戶信息，支持多角色和多因素認證

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `email` | String | ✅ | - | unique | 用戶郵箱地址 |
| `passwordHash` | String | ✅ | - | - | 密碼哈希值 |
| `role` | String | ✅ | - | enum: ['admin', 'manufacturer', 'regulator', 'endUser'] | 用戶角色 |
| `organizationId` | ObjectId | ❌ | - | ref: 'Organization' | 所屬組織ID |
| `firstName` | String | ✅ | - | - | 名字 |
| `lastName` | String | ✅ | - | - | 姓氏 |
| `phone` | String | ❌ | - | - | 電話號碼 |
| `avatarUrl` | String | ❌ | - | - | 頭像URL |
| `twoFactorEnabled` | Boolean | ❌ | false | - | 是否啟用雙因素認證 |
| `twoFactorSecret` | String | ❌ | - | - | 雙因素認證密鑰 |
| `backupCodes` | [String] | ❌ | [] | - | 備用驗證碼 |
| `emailVerified` | Boolean | ❌ | false | - | 郵箱是否驗證 |
| `emailVerificationToken` | String | ❌ | - | - | 郵箱驗證令牌 |
| `emailVerificationExpires` | Date | ❌ | - | - | 郵箱驗證過期時間 |
| `settings.notifications.email` | Boolean | ❌ | true | - | 郵件通知設置 |
| `settings.notifications.sms` | Boolean | ❌ | false | - | 簡訊通知設置 |
| `settings.notifications.push` | Boolean | ❌ | true | - | 推送通知設置 |
| `orgRole` | String | ❌ | 'member' | enum: ['admin', 'member'] | 組織內角色 |
| `status` | String | ❌ | 'active' | enum: ['active', 'inactive'] | 帳戶狀態 |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- `email` (unique)

---

## 🏢 Organization Schema

### 基本信息
- **集合名稱**: `organizations`
- **描述**: 組織信息，支持不同類型的組織和成員管理

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `name` | String | ✅ | - | - | 組織名稱 |
| `type` | String | ✅ | - | enum: ['manufacturer', 'regulator', 'endUser'] | 組織類型 |
| `address` | String | ❌ | - | - | 組織地址 |
| `taxId` | String | ❌ | - | - | 稅號 |
| `email` | String | ❌ | - | - | 組織聯絡郵箱 |
| `contactPhone` | String | ❌ | - | - | 組織聯絡電話 |
| `website` | String | ❌ | - | - | 組織網站 |
| `members` | [ObjectId] | ❌ | [] | ref: 'User' | 組織成員ID列表 |
| `status` | String | ❌ | 'active' | enum: ['active', 'inactive'] | 組織狀態 |
| `invitations[].email` | String | ✅ | - | - | 邀請郵箱 |
| `invitations[].invitedBy` | ObjectId | ✅ | - | ref: 'User' | 邀請人ID |
| `invitations[].invitedAt` | Date | ❌ | Date.now | - | 邀請時間 |
| `invitations[].accepted` | Boolean | ❌ | false | - | 是否已接受 |
| `invitations[].acceptedAt` | Date | ❌ | - | - | 接受時間 |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- 無特殊索引

---

## 📦 Model Schema

### 基本信息
- **集合名稱**: `models`
- **描述**: 產品模型信息，包含詳細的技術規格和合規信息

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `modelName` | String | ✅ | - | - | 模型名稱 |
| `modelNumber` | String | ✅ | - | - | 模型編號 |
| `batchNumber` | String | ❌ | - | unique, auto-generated | 批次號 |
| `description` | String | ❌ | - | - | 模型描述 |
| `manufactureDate` | Date | ❌ | - | - | 製造日期 |
| `expirationDate` | Date | ❌ | - | - | 過期日期 |
| `standards` | [String] | ✅ | - | - | 符合標準列表 |
| `classes` | [String] | ✅ | - | - | 分類列表 |
| `intendedUseCategories` | String | ✅ | - | - | 預期用途類別 |
| `intendedUse` | String | ❌ | - | - | 預期用途描述 |
| `materialComposition.materials` | [String] | ❌ | - | - | 材料組成 |
| `materialComposition.hazardousSubstances` | [String] | ❌ | - | - | 有害物質 |
| `wasteManagement.wasteStreamClassification` | [String] | ❌ | - | - | 廢物流分類 |
| `wasteManagement.labellingAndPackaging` | [String] | ❌ | - | - | 標籤和包裝 |
| `wasteManagement.transportationAndStorage` | String | ❌ | - | - | 運輸和儲存 |
| `disclaimer` | String | ❌ | - | - | 免責聲明 |
| `approvers[].id` | ObjectId | ✅ | - | ref: 'User' | 審核人ID |
| `approvers[].permission` | String | ✅ | - | - | 審核權限 |
| `organizationId` | ObjectId | ✅ | - | ref: 'Organization' | 創建組織ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | 創建者ID |
| `status` | String | ❌ | 'draft' | enum: ['draft', 'published'] | 模型狀態 |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- `batchNumber` (unique)

### 中間件
- **預保存中間件**: 自動生成 `batchNumber`，格式為 `BATCH-YYYYMMDD-XXXX`

---

## 📋 Order Schema

### 基本信息
- **集合名稱**: `orders`
- **描述**: 訂單信息，追蹤產品的生產、使用和處置狀態

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `modelId` | ObjectId | ✅ | - | ref: 'Model' | 關聯模型ID |
| `batchNumber` | String | ✅ | - | trim | 批次號 |
| `endUserCompanyId` | ObjectId | ✅ | - | ref: 'Organization' | 終端用戶公司ID |
| `status` | String | ❌ | 'production' | enum: ['pending', 'production', 'in-used', 'disposed'] | 訂單狀態 |
| `producedQuantity` | Number | ✅ | 0 | min: 0 | 生產數量 |
| `inUseQuantity` | Number | ✅ | 0 | min: 0 | 使用中數量 |
| `disposedQuantity` | Number | ✅ | 0 | min: 0 | 已處置數量 |
| `unusedQuantity` | Number | ✅ | 0 | min: 0 | 未使用數量 |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | 創建者ID |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- `batchNumber`
- `modelId`
- `endUserCompanyId`
- `createdBy`
- `status`

### 驗證規則
1. **Pending 狀態規則**: 
   - `inUseQuantity` 必須為 0
   - `disposedQuantity` 必須為 0
   - `unusedQuantity` 必須等於 `producedQuantity`

2. **數量總和規則**: 
   - `inUseQuantity + disposedQuantity + unusedQuantity = producedQuantity`

### 自動狀態轉換
- 當 `inUseQuantity > 0` 且狀態為 `production` 時，自動轉換為 `in-used`
- 當 `disposedQuantity = producedQuantity` 時，自動轉換為 `disposed`

---

## 📊 OrderReport Schema

### 基本信息
- **集合名稱**: `orderreports`
- **描述**: 訂單處置報告，用於監管審核

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `title` | String | ✅ | - | trim | 報告標題 |
| `description` | String | ✅ | - | - | 報告描述 |
| `status` | String | ❌ | 'pending' | enum: ['pending', 'approved', 'rejected'] | 報告狀態 |
| `orderId` | ObjectId | ✅ | - | ref: 'Order' | 關聯訂單ID |
| `assignedTo` | ObjectId | ✅ | - | ref: 'User' | 指派審核人ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | 創建者ID |
| `comment` | String | ❌ | - | trim | 審核意見 |
| `disposalQuantity` | Number | ✅ | - | min: 0 | 處置數量 |
| `disposalMethod` | String | ❌ | - | trim | 處置方法 |
| `evidenceLinks` | [String] | ❌ | - | URL validation | 證據連結 |
| `materials[].materialKey` | String | ✅ | - | trim | 材料鍵值 |
| `materials[].wasteStreamClassification` | [String] | ❌ | [] | - | 廢物流分類 |
| `materials[].labellingAndPackaging` | [String] | ❌ | [] | - | 標籤和包裝 |
| `materials[].transportationAndStorage` | String | ❌ | '' | - | 運輸和儲存 |
| `materials[].condition` | [String] | ❌ | [] | - | 材料狀況 |
| `materials[].disposalMethod` | [String] | ❌ | [] | - | 處置方法 |
| `materials[].attachments[].fileId` | String | ✅ | - | trim | 文件ID |
| `materials[].attachments[].fileName` | String | ✅ | - | trim | 文件名 |
| `materials[].attachments[].mimeType` | String | ✅ | - | trim | MIME類型 |
| `notes` | String | ❌ | - | trim | 備註 |
| `submittedAt` | Date | ❌ | - | - | 提交時間 |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- `orderId`
- `assignedTo`
- `createdBy`
- `status`
- `createdAt` (降序)

### 驗證規則
- `evidenceLinks` 中的每個URL必須是有效的HTTP或HTTPS URL

---

## 📋 ModelReport Schema

### 基本信息
- **集合名稱**: `modelreports`
- **描述**: 模型審核報告，用於監管審核

### 字段定義

| 字段名 | 類型 | 必填 | 默認值 | 驗證規則 | 描述 |
|--------|------|------|--------|----------|------|
| `title` | String | ✅ | - | trim | 報告標題 |
| `description` | String | ✅ | - | - | 報告描述 |
| `status` | String | ❌ | 'pending' | enum: ['pending', 'approved', 'rejected'] | 報告狀態 |
| `modelId` | ObjectId | ✅ | - | ref: 'Model' | 關聯模型ID |
| `assignedTo` | ObjectId | ✅ | - | ref: 'User' | 指派審核人ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | 創建者ID |
| `comment` | String | ❌ | - | trim | 審核意見 |
| `createdAt` | Date | ❌ | Date.now | - | 創建時間 |
| `updatedAt` | Date | ❌ | Date.now | - | 更新時間 |

### 索引
- `modelId`
- `assignedTo`
- `createdBy`
- `status`
- `createdAt` (降序)

---

## 🔗 關聯關係圖

```
User (1) ←→ (N) Organization
  ↓
User (1) ←→ (N) Model
  ↓
User (1) ←→ (N) Order
  ↓
Model (1) ←→ (N) Order
  ↓
Order (1) ←→ (N) OrderReport
  ↓
Model (1) ←→ (N) ModelReport
```

## 📊 數據庫統計

| 集合 | 文檔數量 | 主要索引 | 平均文檔大小 |
|------|----------|----------|--------------|
| users | ~1000 | email (unique) | ~2KB |
| organizations | ~100 | 無 | ~1KB |
| models | ~5000 | batchNumber (unique) | ~5KB |
| orders | ~20000 | batchNumber, modelId, status | ~1KB |
| orderreports | ~5000 | orderId, status | ~3KB |
| modelreports | ~2000 | modelId, status | ~1KB |

## 🔧 性能優化建議

1. **索引優化**:
   - 為經常查詢的字段添加複合索引
   - 考慮為時間範圍查詢添加索引

2. **查詢優化**:
   - 使用投影來減少返回字段
   - 實施分頁來處理大量數據

3. **數據驗證**:
   - 在應用層實施額外的業務邏輯驗證
   - 使用數據庫約束確保數據完整性 