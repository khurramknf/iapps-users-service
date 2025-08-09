// File: services/users-service/backend/src/common/policy/policy.ts
export type GlobalRole = 'admin' | 'staff' | 'user';
export type GlobalAction =
  | 'read' | 'create' | 'update' | 'delete' | 'restore'
  | 'toggleActive' | 'resetPassword' | 'changeRole' | 'changeEmail';

export function canGlobal(role: GlobalRole, action: GlobalAction): boolean {
  if (role === 'admin') return true;
  if (role === 'staff') {
    return !['changeRole','changeEmail'].includes(action);
  }
  // 'user'
  return ['read'].includes(action);
}

// ---- Tenant (organizations/businesses) ----
export type TenantRole = 'owner' | 'manager';
export type TenantAction =
  | 'org:create'|'org:update'|'org:delete'|'org:restore'
  | 'org:addManager'|'org:removeManager'|'org:transferOwnership'
  | 'biz:create'|'biz:update'|'biz:delete'|'biz:restore'|'biz:addManager'|'biz:removeManager';

export function canTenant(global: GlobalRole, tenantRole: TenantRole | undefined, action: TenantAction) {
  if (global === 'admin') return true;
  if (global === 'staff') return true; // support role; set to false if you don’t want staff to manage tenant data

  if (!tenantRole) return false;

  if (tenantRole === 'owner') return true; // full control within org
  if (tenantRole === 'manager') {
    const forbidden: TenantAction[] = [
      'org:transferOwnership','org:delete','org:restore','org:addManager','org:removeManager'
    ];
    return !forbidden.includes(action);
  }
  return false;
}
