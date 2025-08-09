// File: services/users-service/backend/src/common/guards/policy.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// ---- Types for policy metadata
export type GlobalRole = 'admin' | 'staff' | 'user';
export type PolicyMeta =
  | { type: 'global'; action: string }
  | { type: 'tenant'; action: string };

// ---- Decorator to attach policy metadata
export const POLICY_KEY = 'policy';
export const Policy = (policy: PolicyMeta) => SetMetadata(POLICY_KEY, policy);

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const meta = this.reflector.get<PolicyMeta | undefined>(POLICY_KEY, ctx.getHandler());
    if (!meta) return true;

    const user = req.user as { role: GlobalRole } | undefined;
    if (!user) throw new ForbiddenException('No user');

    if (meta.type === 'global') {
      const { canGlobal } = require('../policy/policy');
      if (!canGlobal(user.role, meta.action)) throw new ForbiddenException('Insufficient rights');
      return true;
    }

    if (meta.type === 'tenant') {
      const { canTenant } = require('../policy/policy');
      const tenantRole = req.tenantRole as any; // set by your tenant resolver
      if (!canTenant(user.role, tenantRole, meta.action)) {
        throw new ForbiddenException('Insufficient tenant rights');
      }
      return true;
    }

    return true;
  }
}
