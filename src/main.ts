/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './config/swagger-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://localhost:3000'
  ).split(',');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error('CORS not allowed'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');

  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `La aplicación se está ejecutando en: http://localhost:${port}/api`,
  );
  console.log(
    `La documentación de la API disponible en: http://localhost:${port}/api/docs`,
  );
  console.log(`CORS habilitado para: http://localhost:5173`);
}
bootstrap();
