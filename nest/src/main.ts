import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // International Aviation Grade Helmet Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI and Nuxt integration
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
    }),
  );

  // Enable CORS for mobile & web flight operations clients
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Strict DTO validation & parameter injection protection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interactive Swagger / OpenAPI Specification
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Susi Air · Pilot Operations API')
    .setDescription(
      'Official REST API documentation for Susi Air Pilot Operations, Duty Limiting, and Electronic Flight Bag (EFB)',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT Bearer token from /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Pilot authentication & token issuance')
    .addTag('Pilot', 'Pilot identity & flight credentials')
    .addTag('Flight Hours', 'Regulatory CASR duty limits & sliding window calculations')
    .addTag('Documents', 'Aviation licenses & medical clearances')
    .addTag('Schedules', 'Monthly duty calendar & live METAR weather')
    .addTag('Logbook', 'Electronic Flight Bag (EFB) leg records')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'Susi Air Pilot API · Interactive Swagger Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Susi Air Pilot API is running on http://0.0.0.0:${port}`);
  logger.log(`Swagger Docs available at http://0.0.0.0:${port}/docs`);
}
bootstrap();
