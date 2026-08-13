import { CampaignRole, ScopeType } from '@electromon/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/** Roles system admin can create/update via agent management */
export const LGA_AGENT_ROLE = CampaignRole.LGA_COLLATION_OFFICER;
export const WARD_AGENT_ROLE = CampaignRole.WARD_RA_OFFICER;
export const PU_AGENT_ROLE = CampaignRole.POLLING_AGENT;

export const MANAGEABLE_AGENT_ROLES = [LGA_AGENT_ROLE, WARD_AGENT_ROLE, PU_AGENT_ROLE] as const;

export type ManageableAgentRole = (typeof MANAGEABLE_AGENT_ROLES)[number];

export class ListAgentsQueryDto {
  @ApiProperty({ example: 'cms147z3t001www9ktkqgluw0' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiPropertyOptional({ enum: ['lga', 'ward', 'pu', 'all'], default: 'all' })
  @IsOptional()
  @IsString()
  kind?: 'lga' | 'ward' | 'pu' | 'all';

  @ApiPropertyOptional({ description: 'Override LGA (director/state only; LGA users locked to scope)' })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;
}

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({ enum: MANAGEABLE_AGENT_ROLES })
  @IsEnum(CampaignRole)
  role: ManageableAgentRole;

  @ApiProperty({
    description: 'LGA id (LGA officer), ward id (ward officer), or polling unit id (PU agent)',
  })
  @IsString()
  @IsNotEmpty()
  scopeId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Optional; auto-generated from phone if omitted' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateAgentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: MANAGEABLE_AGENT_ROLES })
  @IsOptional()
  @IsEnum(CampaignRole)
  role?: ManageableAgentRole;

  @ApiPropertyOptional({ description: 'LGA, ward, or polling unit id matching the role' })
  @IsOptional()
  @IsString()
  scopeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ minLength: 8, description: 'Reset login password' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class AgentResponseDto {
  @ApiProperty()
  membershipId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phoneNumber: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: CampaignRole })
  role: CampaignRole;

  @ApiProperty({ enum: ScopeType })
  scopeType: ScopeType;

  @ApiProperty()
  scopeId: string;

  @ApiProperty()
  scopeName: string;

  @ApiPropertyOptional()
  wardName?: string | null;

  @ApiPropertyOptional()
  lgaName?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  userActive: boolean;

  @ApiProperty()
  createdAt: Date;
}
