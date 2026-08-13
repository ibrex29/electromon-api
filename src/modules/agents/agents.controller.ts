import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CampaignRole, type JwtPayload } from '@electromon/shared';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SWAGGER_BEARER_AUTH } from '../../common/swagger/swagger.config';
import { AgentsService } from './agents.service';
import {
  AgentResponseDto,
  CreateAgentDto,
  ListAgentsQueryDto,
  UpdateAgentDto,
} from './dto/agents.dto';

const AGENT_VIEW_ROLES = [
  CampaignRole.CAMPAIGN_DIRECTOR,
  CampaignRole.CANDIDATE,
  CampaignRole.STATE_COLLATION_OFFICER,
  CampaignRole.LGA_COLLATION_OFFICER,
  CampaignRole.WARD_RA_OFFICER,
] as const;

const AGENT_MANAGE_ROLES = [CampaignRole.CAMPAIGN_DIRECTOR, CampaignRole.CANDIDATE] as const;

@ApiTags('agents')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get('options')
  @Roles(...AGENT_VIEW_ROLES)
  @ApiOperation({
    summary: 'List wards/PUs for filters (LGA/admin) or own ward PUs (ward officer)',
  })
  listOptions(
    @CurrentUser() user: JwtPayload,
    @Query('campaignId') campaignId: string,
    @Query('lgaId') lgaId?: string,
  ) {
    return this.agentsService.listOptions(user, campaignId, lgaId);
  }

  @Get()
  @Roles(...AGENT_VIEW_ROLES)
  @ApiOperation({
    summary: 'List agents (admin: LGA/ward/PU; LGA: ward+PU; ward officer: PU agents)',
  })
  @ApiOkResponse({ type: [AgentResponseDto] })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListAgentsQueryDto) {
    return this.agentsService.list(user, query);
  }

  @Get(':membershipId/activities')
  @Roles(...AGENT_VIEW_ROLES)
  @ApiOperation({ summary: 'Collation and incident activity for an agent' })
  listActivities(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
  ) {
    return this.agentsService.listActivities(user, membershipId);
  }

  @Post()
  @Roles(...AGENT_MANAGE_ROLES)
  @ApiOperation({ summary: 'Create or assign an LGA / ward / PU agent (system admin)' })
  @ApiOkResponse({ type: AgentResponseDto })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(user, dto);
  }

  @Patch(':membershipId')
  @Roles(...AGENT_MANAGE_ROLES)
  @ApiOperation({ summary: 'Update an LGA / ward / PU agent (system admin)' })
  @ApiOkResponse({ type: AgentResponseDto })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(user, membershipId, dto);
  }
}
