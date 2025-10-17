"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data, isPending } = useSession();
  const user = data?.user;
  const router = useRouter();

  useEffect(() => {
    if (!isPending && user) {
      const redirectMap: Record<string, string> = {
        admin: "/dashboard/admin",
        manager: "/dashboard/manager",
        executive: "/dashboard/executive",
        respondent: "/dashboard/respondent",
      };
      
      const userRole = user.role as string;
      const redirectUrl = redirectMap[userRole] || "/dashboard/respondent";
      router.replace(redirectUrl);
    }
  }, [user, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Loading Dashboard...</h1>
        <p className="text-muted-foreground">Redirecting you to your personalized dashboard.</p>
      </div>
    </div>
  );
}