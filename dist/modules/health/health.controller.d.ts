import { MetricsService } from '../../common/metrics/metrics.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
export declare class HealthController {
    private prisma;
    private redis;
    private metrics;
    constructor(prisma: PrismaService, redis: RedisService, metrics: MetricsService);
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: string;
            redis: string;
        };
    }>;
    check(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: string;
            redis: string;
        };
    }>;
    private runChecks;
}
