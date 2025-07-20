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
        url: 'https://api-eolc.muldertech.co.uk', // production domain
      },
      {
        url: 'http://localhost:8080', // local dev
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // 掃描所有路由檔案的 JSDoc 註解
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} 