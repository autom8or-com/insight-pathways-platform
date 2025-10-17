"use client";

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CONTENT_TYPES, CONTENT_STATUS } from "@/lib/schemas/content";
import { Content, ContentType, ContentStatus } from "@/db/schema/content";

interface ContentListProps {
  content: Content[];
  isLoading?: boolean;
  onCreateNew?: () => void;
  onEdit?: (content: Content) => void;
  onDelete?: (contentId: string) => void;
  onDuplicate?: (content: Content) => void;
  onViewStats?: (content: Content) => void;
  onAssign?: (content: Content) => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: ContentFilters) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export function ContentList({
  content,
  isLoading = false,
  onCreateNew,
  onEdit,
  onDelete,
  onDuplicate,
  onViewStats,
  onAssign,
  onPageChange,
  onFilterChange,
  pagination,
}: ContentListProps) {
  const [filters, setFilters] = useState<ContentFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = useCallback(
    (newFilters: Partial<ContentFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
    },
    [filters, onFilterChange]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      handleFilterChange({ search: term || undefined });
    },
    [handleFilterChange]
  );

  const getStatusBadgeVariant = (status: ContentStatus) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeBadgeVariant = (type: ContentType) => {
    switch (type) {
      case "quiz":
        return "default";
      case "trivia":
        return "secondary";
      case "survey":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatContentType = (type: ContentType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatContentStatus = (status: ContentStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Create and manage your quizzes, trivias, and surveys
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange({ type: value === "all" ? undefined : (value as ContentType) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatContentType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange({ status: value === "all" ? undefined : (value as ContentStatus) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {CONTENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatContentStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-") as [
                    "createdAt" | "updatedAt" | "title",
                    "asc" | "desc"
                  ];
                  handleFilterChange({ sortBy, sortOrder });
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      {content.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No content found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filters.type || filters.status
                    ? "Try adjusting your filters or search terms"
                    : "Get started by creating your first quiz, trivia, or survey"}
                </p>
              </div>
              {onCreateNew && !searchTerm && !filters.type && !filters.status && (
                <Button onClick={onCreateNew} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create New Content
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(item.type)}>
                        {formatContentType(item.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {formatContentStatus(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BarChart3 className="h-4 w-4" />
                        {/* TODO: Add question count when we have the data */}
                        --
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.timeLimit ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          {item.timeLimit}m
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No limit</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.deadline ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(item.deadline), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No deadline</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDuplicate && (
                            <DropdownMenuItem onClick={() => onDuplicate(item)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                          )}
                          {onAssign && (
                            <DropdownMenuItem onClick={() => onAssign(item)}>
                              <Users className="mr-2 h-4 w-4" />
                              Assign
                            </DropdownMenuItem>
                          )}
                          {onViewStats && (
                            <DropdownMenuItem onClick={() => onViewStats(item)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Stats
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}