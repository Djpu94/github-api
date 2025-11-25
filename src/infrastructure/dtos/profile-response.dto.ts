// src/infrastructure/controllers/dto/profile-response.dto.ts
import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  username: string;

  @Expose()
  name: string | null;

  @Expose()
  avatar: string;

  @Expose()
  bio: string | null;

  @Expose()
  publicRepos: number;

  @Expose()
  followers: number;

  @Expose()
  profileUrl: string;
}
