"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, FileText, Award, Calendar, Play } from "lucide-react";
import Link from "next/link";

export default function RespondentDashboard() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Complete your assigned assessments.
          </p>
        </div>
        <Badge variant="secondary">Respondent</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Assessments awaiting completion
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/respondent/pending">Start Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Assessments completed
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/respondent/completed">View Results</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">
              Your performance average
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/respondent/performance">Performance</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">
              Last assessment completed
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/respondent/history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Deadlines this week
            </p>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/dashboard/respondent/deadlines">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Start</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Continue your progress
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/respondent/next">Continue Learning</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>
            Your latest assessments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Q4 Compliance Training</p>
                  <p className="text-sm text-muted-foreground">Due in 2 days</p>
                </div>
              </div>
              <Button size="sm">Start</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Product Knowledge Quiz</p>
                  <p className="text-sm text-muted-foreground">Completed - 94%</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View Results</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium">Team Survey</p>
                  <p className="text-sm text-muted-foreground">Due in 5 days</p>
                </div>
              </div>
              <Button size="sm">Start</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}