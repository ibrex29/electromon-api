"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWardScopedUser = isWardScopedUser;
exports.getWardScopeId = getWardScopeId;
exports.requireWardScopeId = requireWardScopeId;
exports.assertWardAccess = assertWardAccess;
exports.assertPollingUnitInWard = assertPollingUnitInWard;
const common_1 = require("@nestjs/common");
const shared_1 = require("@electromon/shared");
function isWardScopedUser(user) {
    return (user.scopeType === shared_1.ScopeType.WARD ||
        user.role === shared_1.CampaignRole.WARD_RA_OFFICER ||
        user.role === shared_1.CampaignRole.WARD_COORDINATOR);
}
function getWardScopeId(user) {
    if (!isWardScopedUser(user))
        return undefined;
    return user.scopeId ?? undefined;
}
function requireWardScopeId(user) {
    const wardId = getWardScopeId(user);
    if (!wardId) {
        throw new common_1.ForbiddenException('Your account is not assigned to a ward');
    }
    return wardId;
}
function assertWardAccess(user, wardId) {
    const scopeId = getWardScopeId(user);
    if (scopeId && scopeId !== wardId) {
        throw new common_1.ForbiddenException('You can only access your assigned ward');
    }
}
async function assertPollingUnitInWard(prisma, pollingUnitId, wardId) {
    const unit = await prisma.pollingUnit.findFirst({
        where: { id: pollingUnitId, wardId },
        select: { wardId: true },
    });
    if (!unit) {
        throw new common_1.ForbiddenException('This polling unit is outside your assigned ward');
    }
}
//# sourceMappingURL=campaign-scope.js.map