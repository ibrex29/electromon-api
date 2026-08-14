import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  readonly activeSessions: Gauge<string>;
  readonly dbPoolTotal: Gauge<string>;
  readonly dbPoolWaiting: Gauge<string>;
  readonly dependencyUp: Gauge<string>;
  private readonly notificationPushTotal: Counter<string>;

  constructor(private prisma: PrismaService) {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'electromon_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'electromon_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.activeSessions = new Gauge({
      name: 'electromon_active_sessions',
      help: 'Active refresh token sessions',
      registers: [this.registry],
    });

    this.dbPoolTotal = new Gauge({
      name: 'electromon_db_pool_total',
      help: 'Total database pool connections',
      registers: [this.registry],
    });

    this.dbPoolWaiting = new Gauge({
      name: 'electromon_db_pool_waiting',
      help: 'Requests waiting for a database connection',
      registers: [this.registry],
    });

    this.dependencyUp = new Gauge({
      name: 'electromon_dependency_up',
      help: 'Dependency health (1=up, 0=down)',
      labelNames: ['dependency'],
      registers: [this.registry],
    });

    this.notificationPushTotal = new Counter({
      name: 'electromon_notification_push_total',
      help: 'Push notification delivery attempts',
      labelNames: ['result'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    setInterval(() => void this.refreshInternalMetrics(), 15_000);
  }

  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    durationSeconds: number,
  ) {
    const labels = { method, route, status: String(status) };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, durationSeconds);
  }

  setDependencyStatus(dependency: string, up: boolean) {
    this.dependencyUp.set({ dependency }, up ? 1 : 0);
  }

  recordNotificationPush(
    result: 'sent' | 'failed' | 'invalid_token' | 'skipped' | 'dry_run',
    count = 1,
  ) {
    this.notificationPushTotal.inc({ result }, count);
  }

  async metrics(): Promise<string> {
    await this.refreshInternalMetrics();
    return this.registry.metrics();
  }

  private async refreshInternalMetrics() {
    try {
      const sessions = await this.prisma.refreshToken.count({
        where: { expiresAt: { gt: new Date() } },
      });
      this.activeSessions.set(sessions);
    } catch {
      this.activeSessions.set(0);
    }

    const pool = this.prisma.getPoolStats();
    this.dbPoolTotal.set(pool.total);
    this.dbPoolWaiting.set(pool.waiting);
  }
}
