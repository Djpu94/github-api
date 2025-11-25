// src/infrastructure/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '../dtos/health-response.dto';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({
    summary: 'Verificar estado del servicio',
    description:
      'Endpoint de health check que confirma que el servicio está funcionando correctamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'github-metrics-service',
      uptime: process.uptime() * 1000,
    };
  }
}
