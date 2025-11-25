// src/infrastructure/controllers/profile.controller.ts
import {
  Controller,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UsernameParamDto } from '../dtos/username-param.dto';
import { ProfileResponseDto } from '../dtos/profile-response.dto';

@ApiTags('profiles')
@Controller('profile')
export class ProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get(':username')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Obtener perfil de GitHub',
    description:
      'Obtiene la información básica de un perfil de GitHub en formato resumido',
  })
  @ApiParam({
    name: 'username',
    description: 'Nombre de usuario de GitHub',
    example: 'octocat',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: ProfileResponseDto,
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
  async getProfile(
    @Param() params: UsernameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.getProfileUseCase.execute(params.username);
    return profile as unknown as ProfileResponseDto;
  }
}
