import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SituationStatus } from '@electromon/shared';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSituationUpdateDto {
  @ApiProperty({ example: 'cms147z3t001www9ktkqgluw0' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pollingUnitId: string;

  @ApiProperty({ enum: SituationStatus })
  @IsEnum(SituationStatus)
  status: SituationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}

export class UpdateSituationUpdateDto extends PartialType(CreateSituationUpdateDto) {}

export class ListSituationUpdatesQueryDto {
  @ApiProperty({ example: 'cms147z3t001www9ktkqgluw0' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiPropertyOptional({ enum: SituationStatus })
  @IsOptional()
  @IsEnum(SituationStatus)
  status?: SituationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pollingUnitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reportedById?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isUrgent?: boolean;
}

export class SituationSummaryQueryDto {
  @ApiProperty({ example: 'cms147z3t001www9ktkqgluw0' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;
}
