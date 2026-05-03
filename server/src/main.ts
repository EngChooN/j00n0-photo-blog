import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { AppModule } from './app.module';
import { validateEnvGuard } from './config/validate-env';

async function bootstrap() {
  validateEnvGuard();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  if (config.get<string>('STORAGE_DRIVER') === 'local') {
    app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
      prefix: '/uploads',
      dotfiles: 'deny',
      etag: true,
      maxAge: '1h',
    });
  }

  app.use(cookieParser());
  const allowedOrigins = (
    config.get<string>('CLIENT_ORIGIN') ?? 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
