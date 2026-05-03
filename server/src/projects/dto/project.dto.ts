import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';

const toBool = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  concept?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  concept?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  clearCover?: boolean;
}
