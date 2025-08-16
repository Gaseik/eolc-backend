import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EOLC API Docs',
      version: '1.0.0',
      description: 'API documentation for EOLC backend',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api-eolc.muldertech.co.uk' 
          : 'http://localhost:8080',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production Server' 
          : 'Local Development Server'
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // 掃描所有路由檔案的 JSDoc 註解
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} 