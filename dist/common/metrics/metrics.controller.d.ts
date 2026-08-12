import type { Request, Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';
export declare class MetricsController {
    private metrics;
    constructor(metrics: MetricsService);
    scrape(req: Request, res: Response): Promise<void>;
}
