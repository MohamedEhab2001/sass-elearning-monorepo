import { IsString, IsBoolean, IsOptional, IsEnum, Matches, MinLength, MaxLength } from 'class-validator';
import { DomainType } from '../../../../../shared/types/domain.types';

export class CreateSubdomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message: 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen',
  })
  subdomain: string;
}

export class CreateCustomDomainDto {
  @IsString()
  @Matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, {
    message: 'Invalid domain format',
  })
  customDomain: string;
}

export class UpdateDomainDto {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CheckSubdomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  subdomain: string;
}
