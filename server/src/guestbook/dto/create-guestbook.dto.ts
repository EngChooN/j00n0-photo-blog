import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGuestbookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(800)
  message!: string;
}
