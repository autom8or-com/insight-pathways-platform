"use client";

import React, { useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, GripVertical, Clock, Calendar } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { contentFormSchema, ContentFormData, CONTENT_TYPES, QUESTION_TYPES } from "@/lib/schemas/content";
import { cn } from "@/lib/utils";

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  onSaveDraft?: (data: ContentFormData) => Promise<void>;
  isLoading?: boolean;
  isDraftSaving?: boolean;
}

export function ContentForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  isDraftSaving = false,
}: ContentFormProps) {
  const [activeTab, setActiveTab] = useState("content");

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "quiz",
      timeLimit: initialData?.timeLimit || null,
      deadline: initialData?.deadline || null,
      scheduledPublishAt: initialData?.scheduledPublishAt || null,
      questions: initialData?.questions || [
        {
          id: uuidv4(),
          questionText: "",
          type: "single_choice",
          order: 0,
          isRequired: true,
          points: 1,
          explanation: "",
          options: [
            { id: uuidv4(), optionText: "", isCorrect: false, order: 0 },
            { id: uuidv4(), optionText: "", isCorrect: false, order: 1 },
          ],
        },
      ],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
    move: moveQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const contentType = watch("type");

  const addQuestion = useCallback(() => {
    const newQuestion = {
      id: uuidv4(),
      questionText: "",
      type: "single_choice" as const,
      order: questionFields.length,
      isRequired: true,
      points: 1,
      explanation: "",
      options: [
        { id: uuidv4(), optionText: "", isCorrect: false, order: 0 },
        { id: uuidv4(), optionText: "", isCorrect: false, order: 1 },
      ],
    };
    appendQuestion(newQuestion);
  }, [appendQuestion, questionFields.length]);

  const handleFormSubmit = async (data: ContentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft && isDirty) {
      try {
        const currentData = form.getValues();
        await onSaveDraft(currentData);
      } catch (error) {
        console.error("Draft save error:", error);
      }
    }
  };

  const updateQuestionOptions = useCallback((questionIndex: number, questionType: string) => {
    const currentQuestions = form.getValues("questions");
    const currentQuestion = currentQuestions[questionIndex];

    if (questionType === "text" || questionType === "rating") {
      // Remove options for text and rating questions
      setValue(`questions.${questionIndex}.options`, []);
    } else if (!currentQuestion.options || currentQuestion.options.length === 0) {
      // Add default options for choice questions
      setValue(`questions.${questionIndex}.options`, [
        { id: uuidv4(), optionText: "", isCorrect: false, order: 0 },
        { id: uuidv4(), optionText: "", isCorrect: false, order: 1 },
      ]);
    }
  }, [form, setValue]);

  const addOption = useCallback((questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    const newOption = {
      id: uuidv4(),
      optionText: "",
      isCorrect: false,
      order: currentOptions.length,
    };
    setValue(`questions.${questionIndex}.options`, [...currentOptions, newOption]);
  }, [form, setValue]);

  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    const updatedOptions = currentOptions.filter((_, index) => index !== optionIndex);
    setValue(`questions.${questionIndex}.options`, updatedOptions);
  }, [form, setValue]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter content title"
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter content description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Content Type *</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn(errors.type && "border-red-500")}>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Limit (minutes)
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      {...register("timeLimit", { valueAsNumber: true })}
                      placeholder="No limit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      {...register("deadline")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledPublishAt">Schedule Publication</Label>
                  <Input
                    id="scheduledPublishAt"
                    type="datetime-local"
                    {...register("scheduledPublishAt")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {questionFields.map((field, questionIndex) => (
                  <Card key={field.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Question {questionIndex + 1}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-move"
                            disabled={questionFields.length <= 1}
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeQuestion(questionIndex)}
                            disabled={questionFields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Controller
                            name={`questions.${questionIndex}.type`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  updateQuestionOptions(questionIndex, value);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUESTION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min="0"
                            {...register(`questions.${questionIndex}.points`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text *</Label>
                        <Textarea
                          {...register(`questions.${questionIndex}.questionText`)}
                          placeholder="Enter your question"
                          rows={2}
                          className={cn(
                            errors.questions?.[questionIndex]?.questionText && "border-red-500"
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Controller
                          name={`questions.${questionIndex}.isRequired`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`required-${questionIndex}`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor={`required-${questionIndex}`} className="text-sm">
                          Required question
                        </Label>
                      </div>

                      {/* Options for choice questions */}
                      {watch(`questions.${questionIndex}.type`) !== "text" &&
                       watch(`questions.${questionIndex}.type`) !== "rating" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                              className="flex items-center gap-1 h-8"
                            >
                              <Plus className="h-3 w-3" />
                              Add Option
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {form.watch(`questions.${questionIndex}.options`)?.map(
                              (option, optionIndex) => (
                                <div key={option.id} className="flex items-center gap-2">
                                  <Controller
                                    name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                                    control={control}
                                    render={({ field }) => (
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <Input
                                    {...register(
                                      `questions.${questionIndex}.options.${optionIndex}.optionText`
                                    )}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                    disabled={
                                      form.watch(`questions.${questionIndex}.options`)?.length <= 2
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Mark the correct answer(s) with the checkboxes
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          {...register(`questions.${questionIndex}.explanation`)}
                          placeholder="Explain the correct answer"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isDirty || isDraftSaving}
              >
                {isDraftSaving ? "Saving..." : "Save Draft"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Content"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}