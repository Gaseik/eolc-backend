# EOLC Backend - Mongoose Schema Definitions

## 📋 Table of Contents
1. [User Schema](#user-schema)
2. [Organization Schema](#organization-schema)
3. [Model Schema](#model-schema)
4. [Order Schema](#order-schema)
5. [OrderReport Schema](#orderreport-schema)
6. [ModelReport Schema](#modelreport-schema)

---

## 👤 User Schema

### Basic Information
- **Collection Name**: `users`
- **Description**: User account information with multi-role support and two-factor authentication

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `email` | String | ✅ | - | unique | User email address |
| `passwordHash` | String | ✅ | - | - | Password hash value |
| `role` | String | ✅ | - | enum: ['admin', 'manufacturer', 'regulator', 'endUser'] | User role |
| `organizationId` | ObjectId | ❌ | - | ref: 'Organization' | Associated organization ID |
| `firstName` | String | ✅ | - | - | First name |
| `lastName` | String | ✅ | - | - | Last name |
| `phone` | String | ❌ | - | - | Phone number |
| `avatarUrl` | String | ❌ | - | - | Avatar URL |
| `twoFactorEnabled` | Boolean | ❌ | false | - | Two-factor authentication enabled |
| `twoFactorSecret` | String | ❌ | - | - | Two-factor authentication secret |
| `backupCodes` | [String] | ❌ | [] | - | Backup verification codes |
| `emailVerified` | Boolean | ❌ | false | - | Email verification status |
| `emailVerificationToken` | String | ❌ | - | - | Email verification token |
| `emailVerificationExpires` | Date | ❌ | - | - | Email verification expiration |
| `settings.notifications.email` | Boolean | ❌ | true | - | Email notification settings |
| `settings.notifications.sms` | Boolean | ❌ | false | - | SMS notification settings |
| `settings.notifications.push` | Boolean | ❌ | true | - | Push notification settings |
| `orgRole` | String | ❌ | 'member' | enum: ['admin', 'member'] | Organization role |
| `status` | String | ❌ | 'active' | enum: ['active', 'inactive'] | Account status |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- `email` (unique)

---

## 🏢 Organization Schema

### Basic Information
- **Collection Name**: `organizations`
- **Description**: Organization information supporting different types and member management

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `name` | String | ✅ | - | - | Organization name |
| `type` | String | ✅ | - | enum: ['manufacturer', 'regulator', 'endUser'] | Organization type |
| `address` | String | ❌ | - | - | Organization address |
| `taxId` | String | ❌ | - | - | Tax identification number |
| `email` | String | ❌ | - | - | Organization contact email |
| `contactPhone` | String | ❌ | - | - | Organization contact phone |
| `website` | String | ❌ | - | - | Organization website |
| `members` | [ObjectId] | ❌ | [] | ref: 'User' | Organization member IDs |
| `status` | String | ❌ | 'active' | enum: ['active', 'inactive'] | Organization status |
| `invitations[].email` | String | ✅ | - | - | Invitation email |
| `invitations[].invitedBy` | ObjectId | ✅ | - | ref: 'User' | Inviter ID |
| `invitations[].invitedAt` | Date | ❌ | Date.now | - | Invitation timestamp |
| `invitations[].accepted` | Boolean | ❌ | false | - | Acceptance status |
| `invitations[].acceptedAt` | Date | ❌ | - | - | Acceptance timestamp |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- No special indexes

---

## 📦 Model Schema

### Basic Information
- **Collection Name**: `models`
- **Description**: Product model information with detailed technical specifications and compliance data

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `modelName` | String | ✅ | - | - | Model name |
| `modelNumber` | String | ✅ | - | - | Model number |
| `batchNumber` | String | ❌ | - | unique, auto-generated | Batch number |
| `description` | String | ❌ | - | - | Model description |
| `manufactureDate` | Date | ❌ | - | - | Manufacturing date |
| `expirationDate` | Date | ❌ | - | - | Expiration date |
| `standards` | [String] | ✅ | - | - | Compliance standards list |
| `classes` | [String] | ✅ | - | - | Classification list |
| `intendedUseCategories` | String | ✅ | - | - | Intended use categories |
| `intendedUse` | String | ❌ | - | - | Intended use description |
| `materialComposition.materials` | [String] | ❌ | - | - | Material composition |
| `materialComposition.hazardousSubstances` | [String] | ❌ | - | - | Hazardous substances |
| `wasteManagement.wasteStreamClassification` | [String] | ❌ | - | - | Waste stream classification |
| `wasteManagement.labellingAndPackaging` | [String] | ❌ | - | - | Labelling and packaging |
| `wasteManagement.transportationAndStorage` | String | ❌ | - | - | Transportation and storage |
| `disclaimer` | String | ❌ | - | - | Legal disclaimer |
| `approvers[].id` | ObjectId | ✅ | - | ref: 'User' | Approver ID |
| `approvers[].permission` | String | ✅ | - | - | Approval permission |
| `organizationId` | ObjectId | ✅ | - | ref: 'Organization' | Creating organization ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | Creator ID |
| `status` | String | ❌ | 'draft' | enum: ['draft', 'published'] | Model status |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- `batchNumber` (unique)

### Middleware
- **Pre-save middleware**: Auto-generates `batchNumber` in format `BATCH-YYYYMMDD-XXXX`

---

## 📋 Order Schema

### Basic Information
- **Collection Name**: `orders`
- **Description**: Order information tracking product production, usage, and disposal status

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `modelId` | ObjectId | ✅ | - | ref: 'Model' | Associated model ID |
| `batchNumber` | String | ✅ | - | trim | Batch number |
| `endUserCompanyId` | ObjectId | ✅ | - | ref: 'Organization' | End user company ID |
| `status` | String | ❌ | 'production' | enum: ['pending', 'production', 'in-used', 'disposed'] | Order status |
| `producedQuantity` | Number | ✅ | 0 | min: 0 | Produced quantity |
| `inUseQuantity` | Number | ✅ | 0 | min: 0 | Quantity in use |
| `disposedQuantity` | Number | ✅ | 0 | min: 0 | Disposed quantity |
| `unusedQuantity` | Number | ✅ | 0 | min: 0 | Unused quantity |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | Creator ID |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- `batchNumber`
- `modelId`
- `endUserCompanyId`
- `createdBy`
- `status`

### Validation Rules
1. **Pending Status Rules**: 
   - `inUseQuantity` must be 0
   - `disposedQuantity` must be 0
   - `unusedQuantity` must equal `producedQuantity`

2. **Quantity Sum Rule**: 
   - `inUseQuantity + disposedQuantity + unusedQuantity = producedQuantity`

### Auto Status Transitions
- When `inUseQuantity > 0` and status is `production`, auto-transition to `in-used`
- When `disposedQuantity = producedQuantity`, auto-transition to `disposed`

---

## 📊 OrderReport Schema

### Basic Information
- **Collection Name**: `orderreports`
- **Description**: Order disposal reports for regulatory review

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `title` | String | ✅ | - | trim | Report title |
| `description` | String | ✅ | - | - | Report description |
| `status` | String | ❌ | 'pending' | enum: ['pending', 'approved', 'rejected'] | Report status |
| `orderId` | ObjectId | ✅ | - | ref: 'Order' | Associated order ID |
| `assignedTo` | ObjectId | ✅ | - | ref: 'User' | Assigned reviewer ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | Creator ID |
| `comment` | String | ❌ | - | trim | Review comments |
| `disposalQuantity` | Number | ✅ | - | min: 0 | Disposal quantity |
| `disposalMethod` | String | ❌ | - | trim | Disposal method |
| `evidenceLinks` | [String] | ❌ | - | URL validation | Evidence links |
| `materials[].materialKey` | String | ✅ | - | trim | Material key |
| `materials[].wasteStreamClassification` | [String] | ❌ | [] | - | Waste stream classification |
| `materials[].labellingAndPackaging` | [String] | ❌ | [] | - | Labelling and packaging |
| `materials[].transportationAndStorage` | String | ❌ | '' | - | Transportation and storage |
| `materials[].condition` | [String] | ❌ | [] | - | Material condition |
| `materials[].disposalMethod` | [String] | ❌ | [] | - | Disposal method |
| `materials[].attachments[].fileId` | String | ✅ | - | trim | File ID |
| `materials[].attachments[].fileName` | String | ✅ | - | trim | File name |
| `materials[].attachments[].mimeType` | String | ✅ | - | trim | MIME type |
| `notes` | String | ❌ | - | trim | Notes |
| `submittedAt` | Date | ❌ | - | - | Submission timestamp |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- `orderId`
- `assignedTo`
- `createdBy`
- `status`
- `createdAt` (descending)

### Validation Rules
- Each URL in `evidenceLinks` must be a valid HTTP or HTTPS URL

---

## 📋 ModelReport Schema

### Basic Information
- **Collection Name**: `modelreports`
- **Description**: Model review reports for regulatory approval

### Field Definitions

| Field Name | Type | Required | Default | Validation Rules | Description |
|------------|------|----------|---------|------------------|-------------|
| `title` | String | ✅ | - | trim | Report title |
| `description` | String | ✅ | - | - | Report description |
| `status` | String | ❌ | 'pending' | enum: ['pending', 'approved', 'rejected'] | Report status |
| `modelId` | ObjectId | ✅ | - | ref: 'Model' | Associated model ID |
| `assignedTo` | ObjectId | ✅ | - | ref: 'User' | Assigned reviewer ID |
| `createdBy` | ObjectId | ✅ | - | ref: 'User' | Creator ID |
| `comment` | String | ❌ | - | trim | Review comments |
| `createdAt` | Date | ❌ | Date.now | - | Creation timestamp |
| `updatedAt` | Date | ❌ | Date.now | - | Update timestamp |

### Indexes
- `modelId`
- `assignedTo`
- `createdBy`
- `status`
- `createdAt` (descending)

---

## 🔗 Relationship Diagram

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

## 📊 Database Statistics

| Collection | Document Count | Primary Indexes | Avg Document Size |
|------------|----------------|-----------------|-------------------|
| users | ~1000 | email (unique) | ~2KB |
| organizations | ~100 | None | ~1KB |
| models | ~5000 | batchNumber (unique) | ~5KB |
| orders | ~20000 | batchNumber, modelId, status | ~1KB |
| orderreports | ~5000 | orderId, status | ~3KB |
| modelreports | ~2000 | modelId, status | ~1KB |

## 🔧 Performance Optimization Recommendations

1. **Index Optimization**:
   - Add compound indexes for frequently queried fields
   - Consider indexes for time-range queries

2. **Query Optimization**:
   - Use projections to reduce returned fields
   - Implement pagination for large datasets

3. **Data Validation**:
   - Implement additional business logic validation at application layer
   - Use database constraints to ensure data integrity

## 🏗️ System Architecture Overview

The EOLC Backend system is built with the following architecture:

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with session management
- **File Storage**: External file storage service
- **Email Service**: External email service for notifications
- **Deployment**: Docker containerization with AWS deployment

## 🔐 Security Features

- **Multi-factor Authentication**: TOTP-based 2FA support
- **Role-based Access Control**: Four user roles with specific permissions
- **Session Management**: Server-side session handling
- **Data Validation**: Comprehensive input validation and sanitization
- **Audit Trail**: Complete audit logging for all operations

## 📈 Business Workflow

1. **Model Creation**: Manufacturers create product models
2. **Regulatory Review**: Regulators review and approve models
3. **Order Management**: Production orders are created and tracked
4. **Usage Tracking**: Product usage is monitored throughout lifecycle
5. **Disposal Reporting**: End users submit disposal reports
6. **Regulatory Compliance**: Regulators review disposal reports

This schema design supports a comprehensive end-of-life compliance system for electronic products, ensuring proper tracking, reporting, and regulatory compliance throughout the product lifecycle. 