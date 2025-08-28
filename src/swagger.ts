import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'awiful API',
      version: '1.0.0',
      description: 'API documentation for Mirrora app',
    },
    servers: [
      {
        url: '', 
      },
    ],
  },
  apis: [path.resolve(__dirname, './modules/**/*.route.ts')],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
