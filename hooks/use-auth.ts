import { useSession } from "@/lib/auth-client";
import { UserRole, hasPermission } from "@/lib/types/auth";
import React from "react";

function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard/admin': ['admin'],
    '/dashboard/manager': ['admin', 'manager'],
    '/dashboard/executive': ['admin', 'executive'],
    '/dashboard/respondent': ['admin', 'manager', 'respondent'],
    '/dashboard': ['admin', 'manager', 'executive', 'respondent'],
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
}

export function useAuth() {
  const { data, isPending, error } = useSession();
  const user = data?.user;
  
  return {
    user,
    isPending,
    error,
    isAuthenticated: !!user,
    role: user?.role as UserRole,
  };
}

export function usePermissions() {
  const { user } = useAuth();
  
  const checkPermission = (resource: string, action: string) => {
    if (!user) return false;
    return hasPermission(user.role as UserRole, resource, action);
  };
  
  const canAccess = (route: string) => {
    if (!user) return false;
    return canAccessRoute(user.role as UserRole, route);
  };
  
  return {
    checkPermission,
    canAccess,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isExecutive: user?.role === "executive",
    isRespondent: user?.role === "respondent",
  };
}