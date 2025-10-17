import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as contentSchema from './schema/content';

export const db = drizzle(process.env.DATABASE_URL!, {
    schema: {
        ...authSchema,
        ...contentSchema,
    },
});

// Export all schemas for easy access
export const schema = {
    ...authSchema,
    ...contentSchema,
};

// Export commonly used tables
export const {
    user,
    session,
    account,
    verification,
    roleEnum,
} = authSchema;

export const {
    content,
    questions,
    questionOptions,
    contentAssignments,
    quizAttempts,
    questionResponses,
    contentDrafts,
    contentTypeEnum,
    questionTypeEnum,
    contentStatusEnum,
} = contentSchema;