import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CampaignRole,
  CollationResultStatus,
  COLLATION_ROLES,
  JwtPayload,
} from '@electromon/shared';
import { CollationService } from './collation.service';
import { CollationBrowseService } from './collation-browse.service';
import { CreateCollationResultDto, RejectCollationResultDto, AttachEc8aPhotoDto, ApproveCollationResultDto } from './dto/collation.dto';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-response.dto';
import { SWAGGER_BEARER_AUTH } from '../../common/swagger/swagger.config';

@ApiTags('collation')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('collation')
export class CollationController {
  constructor(
    private collationService: CollationService,
    private browseService: CollationBrowseService,
  ) {}

  @Get('context')
  @ApiOperation({ summary: 'Campaign and state context for dashboard header' })
  getContext(@CurrentUser() user: JwtPayload) {
    return this.browseService.getContext(user);
  }

  @Get('browse/lgas')
  @ApiOperation({ summary: 'Paginated LGA list with party totals (state-scoped)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  browseLgas(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.browseService.browseLgas(
      user,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('browse/lgas/:lgaId/wards')
  @ApiOperation({ summary: 'Paginated wards in an LGA with party totals' })
  browseWards(
    @CurrentUser() user: JwtPayload,
    @Param('lgaId') lgaId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.browseService.browseWards(
      user,
      lgaId,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('browse/my-wards')
  @ApiOperation({ summary: 'Paginated wards for LGA-scoped user' })
  browseMyWards(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.browseService.browseWardsForUser(
      user,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('browse/wards/:wardId/polling-units')
  @ApiOperation({ summary: 'Paginated polling units in a ward' })
  browsePollingUnits(
    @CurrentUser() user: JwtPayload,
    @Param('wardId') wardId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.browseService.browsePollingUnits(
      user,
      wardId,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('browse/my-polling-units')
  @ApiOperation({ summary: 'Paginated polling units for ward/LGA-scoped user' })
  browseMyPollingUnits(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.browseService.browsePollingUnitsForUser(
      user,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('dashboard')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({
    summary: 'Collation dashboard for current user',
    description:
      'Returns dashboard metadata, geographic scope chain, pending approvals, and current result for the logged-in collation officer.',
  })
  @ApiOkResponse({ description: 'Dashboard payload' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.collationService.getDashboard(user);
  }

  @Get('results')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({ summary: 'List collation results for current scope' })
  @ApiQuery({ name: 'status', enum: CollationResultStatus, required: false })
  @ApiOkResponse({ description: 'Collation results' })
  listResults(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: CollationResultStatus,
  ) {
    return this.collationService.listResults(user, status);
  }

  @Get('pending-approvals')
  @Roles(
    CampaignRole.WARD_RA_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.NATIONAL_COLLATION_OFFICER,
  )
  @ApiOperation({
    summary: 'List submitted results awaiting approval',
    description: 'Returns results from the level immediately below the current officer scope.',
  })
  @ApiOkResponse({ description: 'Pending approval queue' })
  listPending(@CurrentUser() user: JwtPayload) {
    return this.collationService.listPendingApprovals(user);
  }

  @Get('lga/ward-submissions')
  @Roles(CampaignRole.LGA_COLLATION_OFFICER)
  @ApiOperation({ summary: 'Ward collation submissions in the LGA officer scope' })
  listLgaWardSubmissions(@CurrentUser() user: JwtPayload) {
    return this.collationService.listLgaWardSubmissions(user);
  }

  @Get('lga/wards/:wardId/pu-results')
  @Roles(CampaignRole.LGA_COLLATION_OFFICER)
  @ApiOperation({ summary: 'PU results within a ward (read-only for LGA review)' })
  listLgaWardPuResults(@CurrentUser() user: JwtPayload, @Param('wardId') wardId: string) {
    return this.collationService.listLgaWardPuResults(user, wardId);
  }

  @Get('lga/polling-units/:puId/result')
  @Roles(CampaignRole.LGA_COLLATION_OFFICER)
  @ApiOperation({ summary: 'Single PU collation result in the LGA (read-only)' })
  getLgaPuResult(@CurrentUser() user: JwtPayload, @Param('puId') puId: string) {
    return this.collationService.getLgaPuResult(user, puId);
  }

  @Patch('lga/approve-all-wards')
  @Roles(CampaignRole.LGA_COLLATION_OFFICER)
  @ApiOperation({ summary: 'Approve all submitted ward results in the LGA at once' })
  approveAllLgaWardResults(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApproveCollationResultDto,
  ) {
    return this.collationService.approveAllLgaWardResults(user, dto);
  }

  @Get('ward/pu-submissions')
  @Roles(CampaignRole.WARD_RA_OFFICER)
  @ApiOperation({ summary: 'Paginated PU collation submissions in the ward officer scope' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'NOT_STARTED'],
  })
  listWardPuSubmissions(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: CollationResultStatus | 'NOT_STARTED',
  ) {
    return this.collationService.listWardPuSubmissions(user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
    });
  }

  @Patch('ward/resubmit-to-lga')
  @Roles(CampaignRole.WARD_RA_OFFICER)
  @ApiOperation({
    summary:
      'Re-forward ward rollup to LGA after LGA return (requires every PU in the ward approved)',
  })
  resubmitWardToLga(@CurrentUser() user: JwtPayload) {
    return this.collationService.resubmitWardToLga(user);
  }

  @Patch('ward/return-flagged-pus')
  @Roles(CampaignRole.WARD_RA_OFFICER)
  @ApiOperation({
    summary:
      'Return all LGA-flagged polling units to PU agents after LGA returned the ward',
  })
  returnLgaFlaggedPus(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectCollationResultDto,
  ) {
    return this.collationService.returnLgaFlaggedPus(user, dto);
  }

  @Post('results')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({ summary: 'Create or update draft collation result at current scope' })
  upsertResult(@CurrentUser() user: JwtPayload, @Body() dto: CreateCollationResultDto) {
    return this.collationService.upsertResult(user, dto);
  }

  @Patch('results/:id/submit')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({ summary: 'Submit draft result for approval at the next level' })
  submitResult(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.collationService.submitResult(user, id);
  }

  @Patch('results/:id/ec8a')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({ summary: 'Attach an uploaded EC8A form photo to a draft result' })
  attachEc8a(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AttachEc8aPhotoDto,
  ) {
    return this.collationService.attachEc8aPhoto(user, id, dto.photoUrl);
  }

  @Patch('results/:id/approve')
  @Roles(
    CampaignRole.WARD_RA_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.NATIONAL_COLLATION_OFFICER,
  )
  @ApiOperation({ summary: 'Approve a submitted result from the level below' })
  approveResult(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ApproveCollationResultDto,
  ) {
    return this.collationService.approveResult(user, id, dto);
  }

  @Patch('results/:id/reject')
  @Roles(
    CampaignRole.WARD_RA_OFFICER,
    CampaignRole.LGA_COLLATION_OFFICER,
    CampaignRole.STATE_COLLATION_OFFICER,
    CampaignRole.NATIONAL_COLLATION_OFFICER,
  )
  @ApiOperation({
    summary:
      'Reject / return a result from the level below. Ward officers may also return APPROVED PUs while the ward rollup is returned by LGA.',
  })
  rejectResult(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RejectCollationResultDto,
  ) {
    return this.collationService.rejectResult(user, id, dto);
  }

  @Get('results/:id/action-logs')
  @Roles(...COLLATION_ROLES)
  @ApiOperation({ summary: 'Action log for submit / approve / reject on a collation result' })
  listActionLogs(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.collationService.listActionLogs(user, id);
  }
}
