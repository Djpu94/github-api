// src/infrastructure/controllers/profile.controller.ts
import {
  Controller,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UsernameParamDto } from '../dtos/username-param.dto';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('profile')
export class ProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get(':username')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProfile(
    @Param() params: UsernameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.getProfileUseCase.execute(params.username);
    return plainToInstance(ProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }
}
