"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContentList, ContentFilters } from "@/components/content/content-list";
import { Content, ContentType, ContentStatus } from "@/db/schema/content";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, BarChart3, Users, Copy } from "lucide-react";

export default function ContentManagementPage() {
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useSession();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchContent = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/content?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const data = await response.json();
      setContent(data.content || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (session?.user) {
      fetchContent();
    }
  }, [fetchContent, session]);

  const handleCreateNew = () => {
    router.push("/dashboard/manager/content/new");
  };

  const handleEdit = (contentItem: Content) => {
    router.push(`/dashboard/manager/content/edit/${contentItem.id}`);
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/content?id=${contentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      toast.success("Content deleted successfully");
      fetchContent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete content";
      toast.error(errorMessage);
    }
  };

  const handleDuplicate = async (contentItem: Content) => {
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${contentItem.title} (Copy)`,
          description: contentItem.description,
          type: contentItem.type,
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate content");
      }

      toast.success("Content duplicated successfully");
      fetchContent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate content";
      toast.error(errorMessage);
    }
  };

  const handleAssign = (contentItem: Content) => {
    // TODO: Implement assignment functionality
    toast.info("Assignment functionality coming soon");
  };

  const handleViewStats = (contentItem: Content) => {
    // TODO: Implement stats viewing functionality
    toast.info("Analytics functionality coming soon");
  };

  const handleFilterChange = (newFilters: ContentFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (sessionLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Please log in to access content management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Create and manage your quizzes, trivias, and surveys
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ContentList
        content={content}
        isLoading={loading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onAssign={handleAssign}
        onViewStats={handleViewStats}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        pagination={pagination}
      />
    </div>
  );
}