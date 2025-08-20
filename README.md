# EOLC Backend API

End-of-Life Compliance (EOLC) Backend API Service

## 🚀 Quick Start

### 1. Clone Project
```bash
git clone <your-repository-url>
cd eolc-backend
```

### 2. Environment Setup

#### Method 1: Local Development
```bash
# Install dependencies
npm install

# Create environment variables file
cp .env.example .env
# Edit .env file with necessary environment variables

# Build project
npm run build

# Start development server
npm run dev
```

#### Method 2: Docker Deployment
```bash
# Create production environment variables file
cp .env.example .env.production
# Edit .env.production file

# Start with Docker Compose
docker-compose up -d

# Or build with Docker directly
docker build -t eolc-backend .
docker run -p 8080:8080 --env-file .env.production eolc-backend
```

## 📋 Environment Variables Configuration

Create `.env` or `.env.production` file:

```env
# Server Configuration
NODE_ENV=production
PORT=8080

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eolc
# Or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eolc

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# CORS Configuration (Optional)
CORS_ORIGIN=https://dev-eolc.muldertech.co.uk

# Other Configuration
LOG_LEVEL=info
```

## 🐳 Docker Deployment

### Local Docker Testing
```bash
# Build image
docker build -t eolc-backend .

# Run container
docker run -p 8080:8080 --env-file .env.production eolc-backend
```

### Production Environment Deployment
```bash
# Use Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop service
docker-compose down
```

## 🧪 API Testing

### 1. Basic Connection Test
```bash
curl http://localhost:8080/health
```

### 2. User Login Test
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"enduser@test.com","password":"password123"}'
```

### 3. CORS Test (Production Environment)
```bash
# Use provided test script
./test-production-cors.sh
```

## 📊 Main API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/check` - Check authentication status
- `POST /auth/refresh` - Refresh JWT Token

### Order Management
- `GET /orders` - Get order list
- `POST /orders` - Create new order
- `GET /orders/:id` - Get single order
- `PUT /orders/:id` - Update order
- `PATCH /orders/:id/update-quantity` - Update order quantities
- `DELETE /orders/:id` - Delete order

### Order Reports (NEW)
- `GET /order-reports` - Get order reports list
- `POST /order-reports` - Create new order report
- `GET /order-reports/:id` - Get single order report
- `PUT /order-reports/:id` - Update order report
- `DELETE /order-reports/:id` - Delete order report
- `PATCH /order-reports/:id/approve` - Approve order report
- `PATCH /order-reports/:id/reject` - Reject order report

### Model Management
- `GET /models` - Get model list
- `POST /models` - Create new model
- `GET /models/:id` - Get single model
- `PUT /models/:id` - Update model
- `DELETE /models/:id` - Delete model

### Statistics
- `GET /statistics/orders` - Get order statistics
- `GET /statistics/reports` - Get report statistics

### Organization Management
- `GET /organizations` - Get organization list
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization details

### User Management
- `GET /users` - Get user list
- `POST /users/invite` - Invite user
- `PUT /users/:id` - Update user information

## 🔧 Development Tools

### Script Commands
```bash
# Development mode
npm run dev

# Build project
npm run build

# Run tests
npm test

# Code linting
npm run lint

# Format code
npm run format
```

### Test Scripts
```bash
# Test CORS configuration
./test-production-cors.sh

# Test API endpoints
node test-simple-api.js
```

## 🚀 AWS Deployment

### 1. Prepare Deployment
```bash
# Build project
npm run build

# Check build results
ls -la dist/
```

### 2. Upload to AWS
```bash
# Use provided deployment checklist
cat deploy-checklist.md

# Run deployment script
./deploy.sh
```

### 3. Verify Deployment
```bash
# Test production environment CORS
./test-production-cors.sh

# Check service status
curl https://api-eolc.muldertech.co.uk/health
```

## 📝 Project Structure

```
eolc-backend/
├── src/
│   ├── controllers/     # Controller logic
│   │   ├── authController.ts
│   │   ├── orderController.ts
│   │   ├── orderReportController.ts
│   │   ├── modelController.ts
│   │   ├── organizationController.ts
│   │   ├── userController.ts
│   │   └── statisticsController.ts
│   ├── models/         # Data models
│   │   ├── User.ts
│   │   ├── Organization.ts
│   │   ├── Model.ts
│   │   ├── Order.ts
│   │   └── OrderReport.ts
│   ├── routes/         # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── orderReportRoutes.ts
│   │   ├── modelRoutes.ts
│   │   ├── organizationRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── statisticsRoutes.ts
│   ├── middleware/     # Middleware
│   │   ├── auth.ts
│   │   └── cors.ts
│   ├── utils/          # Utility functions
│   └── app.ts          # Application entry point
├── dist/               # Compiled files
├── tests/              # Test files
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🔍 Current Progress & Features

### ✅ Completed Features

1. **Authentication System**
   - JWT-based authentication with automatic token refresh
   - Role-based access control (admin, manufacturer, regulator, endUser)
   - Secure password hashing and validation

2. **Order Management**
   - Complete CRUD operations for orders
   - Automatic status transitions based on quantity changes
   - Quantity validation (producedQuantity = inUseQuantity + disposedQuantity + unusedQuantity)
   - Real-time status updates

3. **Order Reports System (NEW)**
   - Comprehensive disposal reporting functionality
   - Approval workflow for reports
   - Status tracking (pending, approved, rejected)
   - Integration with order quantities

4. **Model Management**
   - Product model CRUD operations
   - Model categorization and organization association

5. **Organization Management**
   - Multi-tenant organization support
   - User-organization relationships

6. **Statistics & Analytics**
   - Order statistics and reporting
   - Data aggregation and analysis

7. **Deployment Infrastructure**
   - Docker containerization
   - AWS EC2 deployment with shell scripts
   - Automated deployment pipeline
   - Health checks and monitoring

### 🔄 In Progress

1. **Enhanced Reporting**
   - Advanced analytics dashboard
   - Export functionality for reports
   - Real-time notifications

2. **API Documentation**
   - Swagger/OpenAPI documentation
   - Interactive API testing interface

3. **Performance Optimization**
   - Database query optimization
   - Caching implementation
   - Rate limiting

### 📋 Technical Architecture

**Backend Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Mongoose schema validation with custom business rules
- **CORS**: Multi-origin support for development and production

**Deployment:**
- **Containerization**: Docker with multi-stage builds
- **Cloud Platform**: AWS EC2
- **Deployment**: Custom shell scripts for automated deployment
- **DNS**: GoDaddy domain management
- **Monitoring**: Health checks and logging

**Security Features:**
- Role-based access control (RBAC)
- JWT token management
- Input validation and sanitization
- CORS configuration
- Secure password handling

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in `.env`
   - Verify frontend domain is in allowed list

2. **Database Connection Errors**
   - Check `MONGODB_URI` configuration
   - Ensure database service is running

3. **JWT Errors**
   - Check `JWT_SECRET` configuration
   - Verify token format is correct

4. **Order Quantity Validation Errors**
   - Ensure producedQuantity equals sum of other quantities
   - Check for negative quantity values

### Log Viewing
```bash
# Docker logs
docker-compose logs -f app

# Local development logs
npm run dev
```

