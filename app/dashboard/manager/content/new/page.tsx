"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContentForm } from "@/components/content/content-form";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useSession } from "@/lib/auth-client";
import { ContentFormData } from "@/lib/schemas/content";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewContentPage() {
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContentFormData | null>(null);

  const handleSaveDraft = useCallback(async (data: ContentFormData) => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/content/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftData: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      // Draft saved successfully
    } catch (error) {
      console.error("Draft save error:", error);
      throw error;
    }
  }, [session]);

  const handleSubmit = async (data: ContentFormData) => {
    if (!session?.user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create content");
      }

      const result = await response.json();
      toast.success("Content created successfully!");
      router.push("/dashboard/manager/content");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create content";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save hook
  const { isSaving: isDraftSaving, lastSaved, saveError } = useAutoSave(
    formData,
    {
      onSave: handleSaveDraft,
      delay: 2000,
      enabled: !!formData && !!session?.user,
    }
  );

  const handleFormChange = useCallback((data: ContentFormData) => {
    setFormData(data);
  }, []);

  if (sessionLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
            Please log in to create content.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Content</h1>
            <p className="text-muted-foreground">
              Create a new quiz, trivia, or survey for your team
            </p>
          </div>
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isDraftSaving && (
            <span>Saving draft...</span>
          )}
          {lastSaved && !isDraftSaving && (
            <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
          )}
          {saveError && (
            <span className="text-red-500">Failed to save draft</span>
          )}
        </div>
      </div>

      {/* Form */}
      <ContentForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={isSubmitting}
        isDraftSaving={isDraftSaving}
      />
    </div>
  );
}