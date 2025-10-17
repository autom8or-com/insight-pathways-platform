"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Settings, Database, BarChart3, Shield, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Manage the entire platform.
          </p>
        </div>
        <Badge variant="destructive">Administrator</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems running normally
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/admin/system">System Status</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Configured</div>
            <p className="text-xs text-muted-foreground">
              Platform settings updated
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/admin/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-xs text-muted-foreground">
              Security protocols active
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/admin/security">Security Center</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Overview</div>
            <p className="text-xs text-muted-foreground">
              Platform-wide analytics
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Actions</div>
            <p className="text-xs text-muted-foreground">
              Common admin tasks
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/manager/content">Create Content</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}