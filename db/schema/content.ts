import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    uuid,
    pgEnum,
    primaryKey
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Content type enumeration
export const contentTypeEnum = pgEnum("content_type", ["quiz", "trivia", "survey"]);
export type ContentType = typeof contentTypeEnum.enumValues[number];

// Question type enumeration
export const questionTypeEnum = pgEnum("question_type", ["single_choice", "multiple_choice", "text", "rating"]);
export type QuestionType = typeof questionTypeEnum.enumValues;

// Content status enumeration
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "scheduled", "expired"]);
export type ContentStatus = typeof contentStatusEnum.enumValues;

// Main content table (quizzes, trivias, surveys)
export const content = pgTable("content", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    type: contentTypeEnum("type").notNull(),
    status: contentStatusEnum("status").default("draft").notNull(),
    creatorId: text("creator_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    timeLimit: integer("time_limit"), // in minutes, null for no limit
    deadline: timestamp("deadline"),
    scheduledPublishAt: timestamp("scheduled_publish_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions table
export const questions = pgTable("questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull().references(() => content.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    type: questionTypeEnum("type").notNull(),
    order: integer("order").notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    points: integer("points").default(1).notNull(),
    explanation: text("explanation"), // for quiz questions
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Question options table (for multiple choice questions)
export const questionOptions = pgTable("question_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content assignments table (assign content to users/teams/departments)
export const contentAssignments = pgTable("content_assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull().references(() => content.id, { onDelete: "cascade" }),
    assignedToType: text("assigned_to_type").notNull(), // "user", "team", "department"
    assignedToId: text("assigned_to_id").notNull(), // user ID, team ID, or department ID
    assignedBy: text("assigned_by").notNull().references(() => user.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    dueDate: timestamp("due_date"),
});

// Quiz attempts table
export const quizAttempts = pgTable("quiz_attempts", {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").notNull().references(() => content.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    score: integer("score"), // percentage score (0-100)
    totalPoints: integer("total_points"),
    earnedPoints: integer("earned_points"),
    timeSpent: integer("time_spent"), // in seconds
    status: text("status").notNull().default("in_progress"), // "in_progress", "completed", "abandoned"
});

// Question responses table
export const questionResponses = pgTable("question_responses", {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    response: jsonb("response").notNull(), // flexible JSON field for different question types
    isCorrect: boolean("is_correct"),
    pointsEarned: integer("points_earned").default(0),
    respondedAt: timestamp("responded_at").defaultNow().notNull(),
});

// Content drafts table (for auto-save functionality)
export const contentDrafts = pgTable("content_drafts", {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id").references(() => content.id, { onDelete: "cascade" }),
    creatorId: text("creator_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    draftData: jsonb("draft_data").notNull(), // complete draft content as JSON
    lastSavedAt: timestamp("last_saved_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;
export type ContentAssignment = typeof contentAssignments.$inferSelect;
export type NewContentAssignment = typeof contentAssignments.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type QuestionResponse = typeof questionResponses.$inferSelect;
export type NewQuestionResponse = typeof questionResponses.$inferInsert;
export type ContentDraft = typeof contentDrafts.$inferSelect;
export type NewContentDraft = typeof contentDrafts.$inferInsert;