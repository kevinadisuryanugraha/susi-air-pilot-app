import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();
let isInitialized = false;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enterprise HTTP Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
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

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation on Serverless
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

  await app.init();
  isInitialized = true;
}

export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    await bootstrapServer();
  }
  server(req, res);
}
