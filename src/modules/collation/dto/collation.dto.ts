import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsObject, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCollationResultDto {
  @ApiPropertyOptional({ example: 850 })
  @IsOptional()
  @IsInt()
  @Min(0)
  registeredVoters?: number;

  @ApiPropertyOptional({ example: 620 })
  @IsOptional()
  @IsInt()
  @Min(0)
  accreditedVoters?: number;

  @ApiPropertyOptional({ example: 615 })
  @IsOptional()
  @IsInt()
  @Min(0)
  votesCast?: number;

  @ApiPropertyOptional({
    example: { APC: 320, PDP: 210, NNPP: 85 },
    description: 'Party vote totals keyed by party code',
  })
  @IsOptional()
  @IsObject()
  partyResults?: Record<string, number>;

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs of uploaded EC8A form images — required before submission at PU level',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ec8aPhotoUrls?: string[];
}

export class AttachEc8aPhotoDto {
  @ApiProperty({ example: 'http://localhost:3001/uploads/abc.jpg' })
  @IsString()
  @MinLength(8)
  photoUrl: string;
}

export class RejectCollationResultDto {
  @ApiProperty({ example: 'Figures do not match signed EC8A form' })
  @IsString()
  reason: string;
}

export class ApproveCollationResultDto {
  @ApiPropertyOptional({ example: 'Figures verified against EC8A' })
  @IsOptional()
  @IsString()
  comment?: string;
}
