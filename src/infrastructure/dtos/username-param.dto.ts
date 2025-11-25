import { IsString, Matches, Length } from 'class-validator';

export class UsernameParamDto {
  @IsString()
  @Length(1, 39)
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: 'Invalid GitHub username format',
  })
  username: string;
}
