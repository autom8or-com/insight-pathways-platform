import { auth } from "@/lib/auth";
import { UserRole, hasPermission, canAccessRoute } from "@/lib/types/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/sign-in');
  }
  
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;
  
  if (!allowedRoles.includes(userRole)) {
    redirect('/dashboard');
  }
  
  return session;
}

export async function hasServerPermission(resource: string, action: string): Promise<boolean> {
  const session = await getServerSession();
  
  if (!session?.user) {
    return false;
  }
  
  return hasPermission(session.user.role as UserRole, resource, action);
}

export function withServerRoleProtection<T extends Record<string, any>>(
  handler: (params: T) => Promise<any>,
  allowedRoles: UserRole[]
) {
  return async (params: T) => {
    const session = await requireRole(allowedRoles);
    return handler({ ...params, user: session.user });
  };
}