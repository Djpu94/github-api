// src/infrastructure/controllers/dto/error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje de error',
    example: 'GitHub user not found',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2023-10-15T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Ruta donde ocurrió el error',
    example: '/api/profile/nonexistent-user',
  })
  path: string;

  @ApiProperty({
    description: 'Método HTTP de la solicitud',
    example: 'GET',
  })
  method: string;
}
