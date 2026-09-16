import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.set('trust proxy', 1);

  // Ensure uploads directory exists and serve statically
  const uploadsDir = existsSync(join(__dirname, '..', 'uploads'))
    ? join(__dirname, '..', 'uploads')
    : join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  // Explicit express static middleware with permissive CORS
  const staticUploads = express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  app.use('/uploads', staticUploads);
  app.use('/api/uploads', staticUploads);

  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  // Enable CORS (allowlist from env + local LAN for mobile testing)
  const configuredOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Check explicit config
      if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Allow localhost, 127.0.0.1 and LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
        origin,
      );
      if (isLocalOrLan) {
        return callback(null, true);
      }

      // In development mode, allow origin to prevent mobile testing blockers
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('MinnaUz 2.0 API')
    .setDescription('Yapon tili taʼlim platformasi backend API hujjatlari')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 MinnaUz 2.0 API ishga tushdi: http://localhost:${port}/api (0.0.0.0:${port})`);
  console.log(`📚 Swagger hujjatlari: http://localhost:${port}/api/docs`);
}
bootstrap();
