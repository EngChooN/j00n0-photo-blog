import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  takenAt?: string;
}

const toStringArray = ({ value }: { value: unknown }): string[] => {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
};

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  takenAt?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  removedPhotoIds?: string[];
}
