"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.AUDIT_ACTION_KEY = exports.SkipAudit = exports.SKIP_AUDIT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.SKIP_AUDIT_KEY = 'skipAudit';
const SkipAudit = () => (0, common_1.SetMetadata)(exports.SKIP_AUDIT_KEY, true);
exports.SkipAudit = SkipAudit;
exports.AUDIT_ACTION_KEY = 'auditAction';
const AuditAction = (action) => (0, common_1.SetMetadata)(exports.AUDIT_ACTION_KEY, action);
exports.AuditAction = AuditAction;
//# sourceMappingURL=audit.decorators.js.map