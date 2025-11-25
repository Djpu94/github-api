// src/infrastructure/controllers/dto/username-param.dto.ts
import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsernameParamDto {
  @ApiProperty({
    description: 'Nombre de usuario de GitHub',
    example: 'octocat',
    minLength: 1,
    maxLength: 39,
    pattern: '^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$',
  })
  @IsString()
  @Length(1, 39)
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: 'Invalid GitHub username format',
  })
  username: string;
}
