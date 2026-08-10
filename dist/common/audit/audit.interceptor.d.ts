import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuditInterceptor implements NestInterceptor {
    private prisma;
    private reflector;
    constructor(prisma: PrismaService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private writeLog;
}
