import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('GitHub Metrics API')
    .setDescription(
      'Microservicio para obtener métricas de perfiles de GitHub con arquitectura hexagonal',
    )
    .setVersion('1.0')
    .setContact(
      'GitHub Metrics Team',
      'https://github.com/your-org/github-metrics',
      'team@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('health', 'Endpoints de verificación del estado del servicio')
    .addTag(
      'profiles',
      'Endpoints para obtener información de perfiles de GitHub',
    )
    .addTag('metrics', 'Endpoints para calcular métricas de perfiles de GitHub')
    .addServer('/api', 'API Base Path')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'GitHub Metrics API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
