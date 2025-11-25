// src/infrastructure/controllers/dto/profile-response.dto.ts
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'Nombre de usuario en GitHub',
    example: 'octocat',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'The Octocat',
    nullable: true,
  })
  @Expose()
  name: string | null;

  @ApiProperty({
    description: 'URL del avatar del usuario',
    example: 'https://avatars.githubusercontent.com/u/583231?v=4',
  })
  @Expose()
  avatar: string;

  @ApiProperty({
    description: 'Biografía del usuario',
    example: 'A mysterious octocat',
    nullable: true,
  })
  @Expose()
  bio: string | null;

  @ApiProperty({
    description: 'Número de repositorios públicos',
    example: 8,
    minimum: 0,
  })
  @Expose()
  publicRepos: number;

  @ApiProperty({
    description: 'Número de seguidores',
    example: 7845,
    minimum: 0,
  })
  @Expose()
  followers: number;

  @ApiProperty({
    description: 'URL del perfil en GitHub',
    example: 'https://github.com/octocat',
  })
  @Expose()
  profileUrl: string;
}
