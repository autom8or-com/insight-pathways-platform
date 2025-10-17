"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types/auth";

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole[];
  resource?: string;
  action?: string;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  roles, 
  resource, 
  action, 
  fallback 
}: RoleGuardProps) {
  const { checkPermission, canAccess } = usePermissions();
  
  let hasAccess = true;
  
  if (roles) {
    const { isAdmin, isManager, isExecutive, isRespondent } = usePermissions();
    
    hasAccess = roles.some(role => {
      switch (role) {
        case 'admin': return isAdmin;
        case 'manager': return isManager;
        case 'executive': return isExecutive;
        case 'respondent': return isRespondent;
        default: return false;
      }
    });
  }
  
  if (resource && action) {
    hasAccess = hasAccess && checkPermission(resource, action);
  }
  
  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground">You don't have permission to view this content.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

interface PermissionGateProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export function PermissionGate({ children, resource, action, fallback }: PermissionGateProps) {
  return (
    <RoleGuard resource={resource} action={action} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}