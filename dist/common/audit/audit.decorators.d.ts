export declare const SKIP_AUDIT_KEY = "skipAudit";
export declare const SkipAudit: () => import("@nestjs/common").CustomDecorator<string>;
export declare const AUDIT_ACTION_KEY = "auditAction";
export declare const AuditAction: (action: string) => import("@nestjs/common").CustomDecorator<string>;
