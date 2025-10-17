import { UserRole } from "@/db/schema/auth";

export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
}

export interface Permission {
  resource: string;
  action: string;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'content', action: 'create' },
    { resource: 'content', action: 'read' },
    { resource: 'content', action: 'update' },
    { resource: 'content', action: 'delete' },
    { resource: 'analytics', action: 'read' },
    { resource: 'system', action: 'manage' },
  ],
  manager: [
    { resource: 'content', action: 'create' },
    { resource: 'content', action: 'read' },
    { resource: 'content', action: 'update' },
    { resource: 'content', action: 'delete' },
    { resource: 'assignments', action: 'create' },
    { resource: 'assignments', action: 'read' },
    { resource: 'assignments', action: 'update' },
    { resource: 'analytics', action: 'read' },
    { resource: 'team', action: 'read' },
  ],
  executive: [
    { resource: 'analytics', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'insights', action: 'read' },
  ],
  respondent: [
    { resource: 'assignments', action: 'read' },
    { resource: 'quizzes', action: 'complete' },
    { resource: 'results', action: 'read:own' },
  ],
};

export function hasPermission(userRole: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(permission => 
    permission.resource === resource && 
    (permission.action === action || permission.action === '*')
  );
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard/admin': ['admin'],
    '/dashboard/manager': ['admin', 'manager'],
    '/dashboard/executive': ['admin', 'executive'],
    '/dashboard/respondent': ['admin', 'manager', 'respondent'],
    '/dashboard': ['admin', 'manager', 'executive', 'respondent'], // Base dashboard
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
}