import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CampaignRole, type JwtPayload } from '@electromon/shared';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SWAGGER_BEARER_AUTH } from '../../common/swagger/swagger.config';
import { AgentsService } from './agents.service';
import { AgentResponseDto, ListAgentsQueryDto } from './dto/agents.dto';

@ApiTags('agents')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get('options')
  @Roles(
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
  )
  @ApiOperation({ summary: 'List wards and polling units in the LGA (for filters)' })
  listOptions(
    @CurrentUser() user: JwtPayload,
    @Query('campaignId') campaignId: string,
    @Query('lgaId') lgaId?: string,
  ) {
    return this.agentsService.listOptions(user, campaignId, lgaId);
  }

  @Get()
  @Roles(
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
  )
  @ApiOperation({ summary: 'List ward and PU agents in an LGA (read-only)' })
  @ApiOkResponse({ type: [AgentResponseDto] })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListAgentsQueryDto) {
    return this.agentsService.list(user, query);
  }

  @Get(':membershipId/activities')
  @Roles(
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
  )
  @ApiOperation({ summary: 'Collation and incident activity for an agent' })
  listActivities(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
  ) {
    return this.agentsService.listActivities(user, membershipId);
  }
}
