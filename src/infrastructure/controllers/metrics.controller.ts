// src/infrastructure/controllers/metrics.controller.ts
import {
  Controller,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetMetricsUseCase } from '../../application/use-cases/get-metrics.use-case';
import { UsernameParamDto } from '../dtos/username-param.dto';
import { MetricsResponseDto } from '../dtos/metrics-response.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly getMetricsUseCase: GetMetricsUseCase) {}

  @Get(':username')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Calcular métricas de GitHub',
    description:
      'Calcula y devuelve métricas derivadas de un perfil de GitHub: total de estrellas, relación seguidores/repositorios y días desde última actividad',
  })
  @ApiParam({
    name: 'username',
    description: 'Nombre de usuario de GitHub',
    example: 'octocat',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas calculadas exitosamente',
    type: MetricsResponseDto,
    examples: {
      'Usuario con actividad': {
        summary: 'Usuario con actividad',
        value: {
          username: 'octocat',
          metrics: {
            totalStars: 1340,
            followersToReposRatio: 21.5,
            lastPushDaysAgo: 12,
          },
        },
      },
      'Usuario sin repositorios': {
        summary: 'Usuario sin repositorios',
        value: {
          username: 'newuser',
          metrics: {
            totalStars: 0,
            followersToReposRatio: null,
            lastPushDaysAgo: null,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro de usuario inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario de GitHub no encontrado',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de tasa de GitHub API excedido',
  })
  @ApiResponse({
    status: 503,
    description: 'GitHub API no disponible',
  })
  async getMetrics(
    @Param() params: UsernameParamDto,
  ): Promise<MetricsResponseDto> {
    const metrics = await this.getMetricsUseCase.execute(params.username);
    return metrics as unknown as MetricsResponseDto;
  }
}
