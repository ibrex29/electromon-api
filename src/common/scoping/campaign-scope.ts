import { ForbiddenException } from '@nestjs/common';
import { CampaignRole, JwtPayload, ScopeType } from '@electromon/shared';

export function isWardScopedUser(user: JwtPayload): boolean {
  return (
    user.scopeType === ScopeType.WARD ||
    user.role === CampaignRole.WARD_RA_OFFICER ||
    user.role === CampaignRole.WARD_COORDINATOR
  );
}

export function getWardScopeId(user: JwtPayload): string | undefined {
  if (!isWardScopedUser(user)) return undefined;
  return user.scopeId ?? undefined;
}

export function requireWardScopeId(user: JwtPayload): string {
  const wardId = getWardScopeId(user);
  if (!wardId) {
    throw new ForbiddenException('Your account is not assigned to a ward');
  }
  return wardId;
}

export function assertWardAccess(user: JwtPayload, wardId: string) {
  const scopeId = getWardScopeId(user);
  if (scopeId && scopeId !== wardId) {
    throw new ForbiddenException('You can only access your assigned ward');
  }
}

export async function assertPollingUnitInWard(
  prisma: { pollingUnit: { findFirst: (args: unknown) => Promise<{ wardId: string } | null> } },
  pollingUnitId: string,
  wardId: string,
) {
  const unit = await prisma.pollingUnit.findFirst({
    where: { id: pollingUnitId, wardId },
    select: { wardId: true },
  });
  if (!unit) {
    throw new ForbiddenException('This polling unit is outside your assigned ward');
  }
}
