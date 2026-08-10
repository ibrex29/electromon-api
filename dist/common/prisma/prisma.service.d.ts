import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@electromon/db';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly pool;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getPoolStats(): {
        total: number;
        idle: number;
        waiting: number;
    };
}
