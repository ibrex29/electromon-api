import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SituationStatus } from '@electromon/shared';

export class SituationPollingUnitDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'JI-HD-001' })
  code: string;

  @ApiProperty({ example: 'Hadejia Central PU 001' })
  name: string;
}

export class SituationReporterDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Campaign' })
  firstName: string;

  @ApiProperty({ example: 'Director' })
  lastName: string;
}

export class SituationUpdateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pollingUnitId: string;

  @ApiProperty({ type: SituationPollingUnitDto })
  pollingUnit: SituationPollingUnitDto;

  @ApiProperty()
  reportedById: string;

  @ApiProperty({ type: SituationReporterDto })
  reporter: SituationReporterDto;

  @ApiProperty({ enum: SituationStatus })
  status: SituationStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  latitude?: number | null;

  @ApiPropertyOptional()
  longitude?: number | null;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class SituationSummaryDto {
  @ApiProperty()
  campaignId: string;

  @ApiProperty({ example: 3 })
  totalUpdates: number;

  @ApiProperty({ example: 1 })
  open: number;

  @ApiProperty({ example: 1 })
  reporting: number;

  @ApiProperty({ example: 1 })
  closed: number;

  @ApiProperty({ example: 0 })
  incidents: number;

  @ApiProperty({ example: 1 })
  urgent: number;

  @ApiProperty({ example: 3 })
  totalPollingUnits: number;

  @ApiProperty({ example: 2 })
  unitsWithUpdates: number;
}
