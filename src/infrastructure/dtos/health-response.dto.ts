import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Estado del servicio',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Fecha y hora de la verificación',
    example: '2023-10-15T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Nombre del servicio',
    example: 'github-metrics-service',
  })
  service: string;

  @ApiProperty({
    description: 'Tiempo de actividad del servicio en milisegundos',
    example: 3600000,
    required: false,
  })
  uptime?: number;
}
