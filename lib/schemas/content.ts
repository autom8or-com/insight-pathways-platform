import { z } from "zod";

// Content type enum values
export const CONTENT_TYPES = ["quiz", "trivia", "survey"] as const;
export const QUESTION_TYPES = ["single_choice", "multiple_choice", "text", "rating"] as const;
export const CONTENT_STATUS = ["draft", "published", "scheduled", "expired"] as const;

// Content creation schema
export const contentCreationSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().optional(),
    type: z.enum(CONTENT_TYPES, {
        required_error: "Content type is required",
    }),
    timeLimit: z.number().int().min(1).optional().or(z.literal(null)),
    deadline: z.string().datetime().optional().or(z.literal(null)),
    scheduledPublishAt: z.string().datetime().optional().or(z.literal(null)),
});

export type ContentCreationData = z.infer<typeof contentCreationSchema>;

// Question schema
export const questionSchema = z.object({
    id: z.string().uuid().optional(),
    questionText: z.string().min(1, "Question text is required").max(1000, "Question must be less than 1000 characters"),
    type: z.enum(QUESTION_TYPES, {
        required_error: "Question type is required",
    }),
    order: z.number().int().min(0),
    isRequired: z.boolean().default(true),
    points: z.number().int().min(0).default(1),
    explanation: z.string().optional(),
    options: z.array(z.object({
        id: z.string().uuid().optional(),
        optionText: z.string().min(1, "Option text is required").max(500, "Option must be less than 500 characters"),
        isCorrect: z.boolean().default(false),
        order: z.number().int().min(0),
    })).optional(),
});

export type QuestionData = z.infer<typeof questionSchema>;

// Complete content form schema (content + questions)
export const contentFormSchema = contentCreationSchema.extend({
    questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export type ContentFormData = z.infer<typeof contentFormSchema>;

// Content update schema
export const contentUpdateSchema = contentCreationSchema.extend({
    id: z.string().uuid(),
    status: z.enum(CONTENT_STATUS).optional(),
});

export type ContentUpdateData = z.infer<typeof contentUpdateSchema>;

// Content assignment schema
export const contentAssignmentSchema = z.object({
    contentId: z.string().uuid(),
    assignedToType: z.enum(["user", "team", "department"]),
    assignedToId: z.string().min(1, "Assignment target is required"),
    dueDate: z.string().datetime().optional().or(z.literal(null)),
});

export type ContentAssignmentData = z.infer<typeof contentAssignmentSchema>;

// Content draft schema (for auto-save)
export const contentDraftSchema = z.object({
    contentId: z.string().uuid().optional(),
    draftData: contentFormSchema,
});

export type ContentDraftData = z.infer<typeof contentDraftSchema>;

// Query schemas for API
export const contentQuerySchema = z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("10"),
    type: z.enum(CONTENT_TYPES).optional(),
    status: z.enum(CONTENT_STATUS).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ContentQueryData = z.infer<typeof contentQuerySchema>;