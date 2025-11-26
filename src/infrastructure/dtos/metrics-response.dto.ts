import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MetricsDataDto {
  @ApiProperty({
    description:
      'Total de estrellas acumuladas en todos los repositorios públicos',
    example: 1340,
    minimum: 0,
  })
  @Expose()
  totalStars: number;

  @ApiProperty({
    description:
      'Relación entre seguidores y cantidad de repositorios públicos',
    example: 21.5,
    nullable: true,
    minimum: 0,
  })
  @Expose()
  followersToReposRatio: number | null;

  @ApiProperty({
    description:
      'Días transcurridos desde la última actividad en algún repositorio',
    example: 12,
    nullable: true,
    minimum: 0,
  })
  @Expose()
  lastPushDaysAgo: number | null;
}

export class MetricsResponseDto {
  static fromEntity(): MetricsResponseDto | PromiseLike<MetricsResponseDto> {
    throw new Error('Method not implemented.');
  }
  @ApiProperty({
    description: 'Nombre de usuario en GitHub',
    example: 'octocat',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Métricas calculadas del usuario',
    type: MetricsDataDto,
  })
  @Expose()
  metrics: MetricsDataDto;
}
