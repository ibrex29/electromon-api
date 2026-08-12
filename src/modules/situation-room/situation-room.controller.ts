import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CampaignRole } from '@electromon/shared';
import type { JwtPayload } from '@electromon/shared';
import { AuditAction } from '../../common/audit/audit.decorators';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto, MessageResponseDto } from '../../common/dto/api-response.dto';
import { SWAGGER_BEARER_AUTH } from '../../common/swagger/swagger.config';
import {
  CreateSituationUpdateDto,
  ListSituationUpdatesQueryDto,
  SituationSummaryQueryDto,
  UpdateSituationUpdateDto,
} from './dto/situation-update.dto';
import {
  SituationSummaryDto,
  SituationUpdateResponseDto,
} from './dto/situation-update-response.dto';
import { SituationRoomService } from './situation-room.service';

@ApiTags('situation-room')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('situation-room')
export class SituationRoomController {
  constructor(private situationRoomService: SituationRoomService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Election day situation summary' })
  @ApiOkResponse({ type: SituationSummaryDto })
  summary(@CurrentUser() user: JwtPayload, @Query() query: SituationSummaryQueryDto) {
    return this.situationRoomService.getSummary(user, query.campaignId);
  }

  @Get('updates')
  @ApiOperation({ summary: 'List situation updates for a campaign' })
  @ApiOkResponse({ type: [SituationUpdateResponseDto] })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListSituationUpdatesQueryDto) {
    return this.situationRoomService.list(user, query);
  }

  @Get('updates/:id')
  @ApiOperation({ summary: 'Get situation update by ID' })
  @ApiQuery({ name: 'campaignId', required: true })
  @ApiOkResponse({ type: SituationUpdateResponseDto })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('campaignId') campaignId: string,
  ) {
    return this.situationRoomService.findOne(user, id, campaignId);
  }

  @Post('updates')
  @Roles(
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
    CampaignRole.WARD_RA_OFFICER,
    CampaignRole.POLLING_AGENT_COORDINATOR,
    CampaignRole.POLLING_AGENT,
  )
  @AuditAction('situation_update.create')
  @ApiOperation({ summary: 'Post a situation update from the field' })
  @ApiCreatedResponse({ type: SituationUpdateResponseDto })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSituationUpdateDto) {
    return this.situationRoomService.create(user, dto);
  }

  @Patch('updates/:id')
  @Roles(
    CampaignRole.CAMPAIGN_DIRECTOR,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
    CampaignRole.WARD_RA_OFFICER,
    CampaignRole.POLLING_AGENT_COORDINATOR,
    CampaignRole.POLLING_AGENT,
  )
  @AuditAction('situation_update.update')
  @ApiOperation({ summary: 'Update a situation update' })
  @ApiOkResponse({ type: SituationUpdateResponseDto })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSituationUpdateDto,
  ) {
    return this.situationRoomService.update(user, id, dto);
  }

  @Delete('updates/:id')
  @Roles(CampaignRole.CAMPAIGN_DIRECTOR, CampaignRole.STATE_COLLATION_OFFICER)
  @AuditAction('situation_update.delete')
  @ApiOperation({ summary: 'Delete a situation update' })
  @ApiQuery({ name: 'campaignId', required: true })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('campaignId') campaignId: string,
  ) {
    return this.situationRoomService.remove(user, id, campaignId);
  }
}
