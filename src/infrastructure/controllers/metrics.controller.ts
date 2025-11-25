// src/infrastructure/controllers/metrics.controller.ts
import {
  Controller,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GetMetricsUseCase } from '../../application/use-cases/get-metrics.use-case';
import { UsernameParamDto } from '../dtos/username-param.dto';
import { MetricsResponseDto } from '../dtos/metrics-response.dto';
import { Metrics } from '../../domain/entities/metrics.entity';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly getMetricsUseCase: GetMetricsUseCase) {}

  @Get(':username')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMetrics(
    @Param() params: UsernameParamDto,
  ): Promise<MetricsResponseDto> {
    try {
      const metrics: Metrics = await this.getMetricsUseCase.execute(
        params.username,
      );
      return MetricsResponseDto.fromEntity(metrics);
    } catch (error) {
      // Manejar errores específicos
      if (error instanceof HttpException) {
        throw error;
      }

      // Error genérico
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
