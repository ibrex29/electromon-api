import { OnModuleInit } from '@nestjs/common';
import { Gauge, Registry } from 'prom-client';
import { PrismaService } from '../prisma/prisma.service';
export declare class MetricsService implements OnModuleInit {
    private prisma;
    readonly registry: Registry<"text/plain; version=0.0.4; charset=utf-8">;
    private readonly httpRequestsTotal;
    private readonly httpRequestDuration;
    readonly activeSessions: Gauge<string>;
    readonly dbPoolTotal: Gauge<string>;
    readonly dbPoolWaiting: Gauge<string>;
    readonly dependencyUp: Gauge<string>;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    recordHttpRequest(method: string, route: string, status: number, durationSeconds: number): void;
    setDependencyStatus(dependency: string, up: boolean): void;
    metrics(): Promise<string>;
    private refreshInternalMetrics;
}
