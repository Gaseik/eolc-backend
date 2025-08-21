# EOLC Backend API Specification

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Organizations](#organization-endpoints)
   - [Models](#model-endpoints)
   - [Orders](#order-endpoints)
   - [Order Reports](#order-report-endpoints)
   - [Model Reports](#model-report-endpoints)
   - [Statistics](#statistics-endpoints)
6. [Data Models](#data-models)
7. [Response Codes](#response-codes)

---

## 🌐 Overview

The EOLC (End-of-Life Compliance) Backend API provides comprehensive endpoints for managing electronic product lifecycle compliance, including user management, organization management, product models, orders, and regulatory reporting.

### Key Features
- **JWT-based Authentication** with session management
- **Role-based Access Control** (Admin, Manufacturer, Regulator, End User)
- **Organization Management** with invitation system
- **Product Model Management** with regulatory approval workflow
- **Order Tracking** with lifecycle status management
- **Disposal Reporting** for regulatory compliance
- **Statistics and Analytics** for compliance monitoring

---

## 🔐 Authentication

### Authentication Method
The API uses **JWT (JSON Web Tokens)** for authentication with server-side session management.

### Token Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Headers
```
Authorization: Bearer <token>
Cookie: token=<token>
```

### Token Refresh
Tokens are automatically refreshed on each request. The new token is returned in the response headers.

---

## 🌍 Base URL

### Development
```
http://localhost:8080
```

### Production
```
https://api-eolc.muldertech.co.uk
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔗 API Endpoints

### Authentication Endpoints

#### POST /auth/signup
**User Registration**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "507f1f77bcf86cd799439011",
  "role": "manufacturer",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "manufacturer",
      "organizationId": "507f1f77bcf86cd799439011"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/signup-with-organization
**Direct Organization Registration**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "507f1f77bcf86cd799439011",
  "role": "manufacturer",
  "orgRole": "member",
  "phone": "+1234567890"
}
```

#### POST /auth/login
**User Login**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "manufacturer",
      "organizationId": "507f1f77bcf86cd799439011"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/logout
**User Logout**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/check
**Check Authentication Status**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "manufacturer",
      "organizationId": "507f1f77bcf86cd799439011"
    }
  }
}
```

#### GET /auth/profile
**Get User Profile**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manufacturer",
    "organizationId": "507f1f77bcf86cd799439011",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "twoFactorEnabled": false,
    "emailVerified": true,
    "orgRole": "member",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /auth/profile
**Update User Profile**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### POST /auth/change-password
**Change Password**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### POST /auth/forgot-password
**Forgot Password**

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
**Reset Password**

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

#### POST /auth/email-verification
**Email Verification**

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

---

### User Endpoints

#### GET /users
**Get Users List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by name or email
- `role` (string) - Filter by role
- `status` (string) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439012",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "manufacturer",
        "organizationId": "507f1f77bcf86cd799439011",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

#### GET /users/:id
**Get User by ID**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manufacturer",
    "organizationId": "507f1f77bcf86cd799439011",
    "phone": "+1234567890",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /users/:id
**Update User**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "active"
}
```

#### DELETE /users/:id
**Delete User**

**Headers:**
```
Authorization: Bearer <token>
```

---

### Organization Endpoints

#### POST /organizations
**Create Organization**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Tech Corp",
  "type": "manufacturer",
  "address": "123 Tech Street, City, Country",
  "taxId": "TAX123456",
  "email": "contact@techcorp.com",
  "contactPhone": "+1234567890",
  "website": "https://techcorp.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Tech Corp",
    "type": "manufacturer",
    "address": "123 Tech Street, City, Country",
    "taxId": "TAX123456",
    "email": "contact@techcorp.com",
    "contactPhone": "+1234567890",
    "website": "https://techcorp.com",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /organizations
**Get Organizations List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by name
- `type` (string) - Filter by type
- `status` (string) - Filter by status

#### GET /organizations/:id
**Get Organization by ID**

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /organizations/:id
**Update Organization**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Tech Corp",
  "address": "456 New Street, City, Country",
  "email": "newcontact@techcorp.com"
}
```

#### POST /organizations/:id/invite
**Invite User to Organization**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "manufacturer"
}
```

#### GET /organizations/:id/invitations
**Get Organization Invitations**

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /organizations/accept-invitation
**Accept Organization Invitation**

**Request Body:**
```json
{
  "invitationId": "507f1f77bcf86cd799439014"
}
```

---

### Model Endpoints

#### POST /models
**Create Model**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "modelName": "Smartphone X1",
  "modelNumber": "SPX1-2024",
  "description": "Latest smartphone model",
  "manufactureDate": "2024-01-15",
  "expirationDate": "2029-01-15",
  "standards": ["ISO 14001", "RoHS"],
  "classes": ["Class A", "Class B"],
  "intendedUseCategories": "Consumer Electronics",
  "intendedUse": "Personal communication device",
  "materialComposition": {
    "materials": ["Plastic", "Metal", "Glass"],
    "hazardousSubstances": ["Lead", "Mercury"]
  },
  "wasteManagement": {
    "wasteStreamClassification": ["Electronic Waste"],
    "labellingAndPackaging": ["Recyclable", "Hazardous"],
    "transportationAndStorage": "Special handling required"
  },
  "disclaimer": "This product contains hazardous materials",
  "approvers": [
    {
      "id": "507f1f77bcf86cd799439012",
      "permission": "review"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "modelName": "Smartphone X1",
    "modelNumber": "SPX1-2024",
    "batchNumber": "BATCH-20240115-0001",
    "description": "Latest smartphone model",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /models
**Get Models List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by name or number
- `status` (string) - Filter by status
- `scope` (string) - Query scope (my/organization)

#### GET /models/:id
**Get Model by ID**

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /models/:id
**Update Model**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "modelName": "Updated Smartphone X1",
  "description": "Updated description"
}
```

#### DELETE /models/:id
**Delete Model**

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /models/approvers
**Get Available Approvers**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "regulator"
    }
  ]
}
```

---

### Order Endpoints

#### POST /orders
**Create Order**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "modelId": "507f1f77bcf86cd799439015",
  "batchNumber": "BATCH-20240115-0001",
  "endUserCompanyId": "507f1f77bcf86cd799439013",
  "producedQuantity": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439016",
    "modelId": "507f1f77bcf86cd799439015",
    "batchNumber": "BATCH-20240115-0001",
    "endUserCompanyId": "507f1f77bcf86cd799439013",
    "status": "production",
    "producedQuantity": 1000,
    "inUseQuantity": 0,
    "disposedQuantity": 0,
    "unusedQuantity": 1000,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /orders
**Get Orders List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by batch number or company
- `status` (string) - Filter by status
- `scope` (string) - Query scope (my/organization)

#### GET /orders/:id
**Get Order by ID**

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /orders/:id
**Update Order**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "inUseQuantity": 500,
  "disposedQuantity": 100,
  "unusedQuantity": 400
}
```

#### DELETE /orders/:id
**Delete Order**

**Headers:**
```
Authorization: Bearer <token>
```

---

### Order Report Endpoints

#### POST /order-reports
**Create Order Report**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Disposal Report for Smartphone X1",
  "description": "Comprehensive disposal report for smartphone batch",
  "orderId": "507f1f77bcf86cd799439016",
  "assignedTo": "507f1f77bcf86cd799439012",
  "disposalQuantity": 100,
  "disposalMethod": "Recycling",
  "evidenceLinks": ["https://example.com/evidence1.pdf"],
  "materials": [
    {
      "materialKey": "plastic",
      "wasteStreamClassification": ["Plastic Waste"],
      "labellingAndPackaging": ["Recyclable"],
      "transportationAndStorage": "Standard handling",
      "condition": ["Good"],
      "disposalMethod": ["Recycling"],
      "attachments": [
        {
          "fileId": "file123",
          "fileName": "plastic_evidence.pdf",
          "mimeType": "application/pdf"
        }
      ]
    }
  ],
  "notes": "All materials properly disposed"
}
```

#### GET /order-reports
**Get Order Reports List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status
- `orderId` (string) - Filter by order ID

#### GET /order-reports/:id
**Get Order Report by ID**

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /order-reports/:id
**Update Order Report**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "comment": "Report approved after review"
}
```

#### DELETE /order-reports/:id
**Delete Order Report**

**Headers:**
```
Authorization: Bearer <token>
```

---

### Model Report Endpoints

#### POST /model-reports
**Create Model Report**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Model Review Report",
  "description": "Comprehensive review of smartphone model",
  "modelId": "507f1f77bcf86cd799439015",
  "assignedTo": "507f1f77bcf86cd799439012"
}
```

#### GET /model-reports
**Get Model Reports List**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status
- `modelId` (string) - Filter by model ID

#### GET /model-reports/:id
**Get Model Report by ID**

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /model-reports/:id
**Update Model Report**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "comment": "Model meets all compliance requirements"
}
```

#### DELETE /model-reports/:id
**Delete Model Report**

**Headers:**
```
Authorization: Bearer <token>
```

---

### Statistics Endpoints

#### GET /statistics/orders
**Get Order Statistics**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string) - Time period (day/week/month/year)
- `startDate` (string) - Start date (YYYY-MM-DD)
- `endDate` (string) - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1500,
    "totalProduced": 50000,
    "totalInUse": 30000,
    "totalDisposed": 15000,
    "totalUnused": 5000,
    "statusDistribution": {
      "pending": 100,
      "production": 800,
      "in-used": 400,
      "disposed": 200
    },
    "periodData": [
      {
        "date": "2024-01-15",
        "orders": 50,
        "produced": 2000,
        "disposed": 500
      }
    ]
  }
}
```

#### GET /statistics/models
**Get Model Statistics**

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /statistics/reports
**Get Report Statistics**

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /statistics/compliance
**Get Compliance Statistics**

**Headers:**
```
Authorization: Bearer <token>
```

---

## 📊 Data Models

### User Model
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|manufacturer|regulator|endUser",
  "organizationId": "string",
  "phone": "string",
  "avatarUrl": "string",
  "twoFactorEnabled": "boolean",
  "emailVerified": "boolean",
  "orgRole": "admin|member",
  "status": "active|inactive",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Organization Model
```json
{
  "id": "string",
  "name": "string",
  "type": "manufacturer|regulator|endUser",
  "address": "string",
  "taxId": "string",
  "email": "string",
  "contactPhone": "string",
  "website": "string",
  "members": ["string"],
  "status": "active|inactive",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Model Model
```json
{
  "id": "string",
  "modelName": "string",
  "modelNumber": "string",
  "batchNumber": "string",
  "description": "string",
  "manufactureDate": "date",
  "expirationDate": "date",
  "standards": ["string"],
  "classes": ["string"],
  "intendedUseCategories": "string",
  "intendedUse": "string",
  "materialComposition": {
    "materials": ["string"],
    "hazardousSubstances": ["string"]
  },
  "wasteManagement": {
    "wasteStreamClassification": ["string"],
    "labellingAndPackaging": ["string"],
    "transportationAndStorage": "string"
  },
  "disclaimer": "string",
  "approvers": [
    {
      "id": "string",
      "permission": "string"
    }
  ],
  "organizationId": "string",
  "createdBy": "string",
  "status": "draft|published",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Order Model
```json
{
  "id": "string",
  "modelId": "string",
  "batchNumber": "string",
  "endUserCompanyId": "string",
  "status": "pending|production|in-used|disposed",
  "producedQuantity": "number",
  "inUseQuantity": "number",
  "disposedQuantity": "number",
  "unusedQuantity": "number",
  "createdBy": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### OrderReport Model
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "pending|approved|rejected",
  "orderId": "string",
  "assignedTo": "string",
  "createdBy": "string",
  "comment": "string",
  "disposalQuantity": "number",
  "disposalMethod": "string",
  "evidenceLinks": ["string"],
  "materials": [
    {
      "materialKey": "string",
      "wasteStreamClassification": ["string"],
      "labellingAndPackaging": ["string"],
      "transportationAndStorage": "string",
      "condition": ["string"],
      "disposalMethod": ["string"],
      "attachments": [
        {
          "fileId": "string",
          "fileName": "string",
          "mimeType": "string"
        }
      ]
    }
  ],
  "notes": "string",
  "submittedAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### ModelReport Model
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "pending|approved|rejected",
  "modelId": "string",
  "assignedTo": "string",
  "createdBy": "string",
  "comment": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

---

## 📋 Response Codes

### Success Responses
- `200` - OK (GET, PUT, DELETE operations)
- `201` - Created (POST operations)
- `204` - No Content (DELETE operations)

### Error Responses
- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Missing or invalid authentication)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `422` - Unprocessable Entity (Validation errors)
- `429` - Too Many Requests (Rate limiting)
- `500` - Internal Server Error (Server error)

### Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute per user

### Pagination
All list endpoints support pagination with the following response format:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## 🔐 Security Considerations

### Authentication
- JWT tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens are stored server-side for enhanced security
- Automatic token refresh on each request

### Authorization
- Role-based access control (RBAC)
- Organization-level permissions
- Resource ownership validation
- API rate limiting

### Data Protection
- All sensitive data is encrypted
- HTTPS required for all communications
- Input validation and sanitization
- SQL injection protection

### Audit Logging
- All API requests are logged
- User actions are tracked
- Compliance audit trail
- Error monitoring and alerting

---

## 📚 Additional Resources

### SDKs and Libraries
- **JavaScript/TypeScript**: Official SDK available
- **Python**: REST API client library
- **Java**: Spring Boot integration
- **C#**: .NET client library

### Documentation
- **Interactive API Docs**: Available at `/docs` endpoint
- **Postman Collection**: Available for download
- **OpenAPI Specification**: Available at `/api-docs` endpoint

### Support
- **Email**: support@eolc.com
- **Documentation**: https://docs.eolc.com
- **Status Page**: https://status.eolc.com

---

*This API specification is version 1.0.0 and was last updated on January 15, 2024.* 