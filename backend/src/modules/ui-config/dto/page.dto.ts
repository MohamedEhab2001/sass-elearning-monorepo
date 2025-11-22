import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PageStatus } from '../schemas/page.schema';

export class PageSectionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  order: number;

  @IsOptional()
  props?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionDto)
  @IsOptional()
  sections?: PageSectionDto[];
}

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionDto)
  @IsOptional()
  sections?: PageSectionDto[];

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;
}

export class UpdatePageSectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionDto)
  sections: PageSectionDto[];
}

export class PublishPageDto {
  @IsEnum(PageStatus)
  status: PageStatus;
}
