import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mirrora Api',
      version: '1.0.0',
      description: '',
    },
    servers: [
      {
        url: 'https://mirriora.onrender.com',
        description: 'deployment server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.resolve(__dirname, './modules/**/*.route.ts')],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;