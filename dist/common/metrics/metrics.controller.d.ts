import type { Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';
export declare class MetricsController {
    private metrics;
    constructor(metrics: MetricsService);
    scrape(res: Response): Promise<void>;
}
