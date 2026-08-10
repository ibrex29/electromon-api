import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
export declare class MetricsInterceptor implements NestInterceptor {
    private metrics;
    constructor(metrics: MetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private record;
}
