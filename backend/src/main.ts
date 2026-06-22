import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { QueryErrorFilter } from './common/filters/query-error.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // WebSocket adapter for Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  // Serve uploaded media (legacy /uploads/<file> URLs from before media moved
  // behind signed tokens, plus the uploads/posts files written by the upload
  // controller). nginx proxies /uploads/ to this backend; without this handler
  // every legacy post/chat/story image and video 404s. New uploads also have a
  // token-protected route at /api/v1/media/:type/:file. Served from cwd/uploads
  // to match where multer writes (./uploads).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // Translate DB-level errors (invalid UUID, FK/unique violations) into clean 4xx
  app.useGlobalFilters(new QueryErrorFilter());

  // CORS: restrict to known origins in production; allow all in development.
  // When CORS_ORIGIN is unset we must NOT fall back to wildcard in production —
  // that would let any site make credentialed cross-origin calls. Deny instead.
  // (The web app and API are same-origin behind nginx, so this doesn't affect
  // first-party requests.)
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((o) => o.trim())
      : process.env.NODE_ENV === 'production'
        ? false
        : true,
    credentials: true,
  });

  const port = process.env.API_PORT || 3000;
  await app.listen(port);

  // Swagger docs (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tayyibt API')
      .setDescription('AI-powered matchmaking platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }
}
bootstrap();
