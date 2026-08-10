import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { SkipAudit } from '../audit/audit.decorators';
import { Public } from '../decorators/auth.decorators';
import { MetricsService } from '../metrics/metrics.service';

@ApiExcludeController()
@SkipAudit()
@Controller('metrics')
export class MetricsController {
  constructor(private metrics: MetricsService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async scrape(@Res() res: Response) {
    res.send(await this.metrics.metrics());
  }
}
