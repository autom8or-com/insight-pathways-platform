import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { content, questions, questionOptions, user } from '@/db/schema';
import { eq, desc, asc, ilike, and, or, count } from 'drizzle-orm';
import { requireRole } from '@/lib/server-auth';
import { contentQuerySchema, ContentQueryData } from '@/lib/schemas/content';
import { v4 as uuidv4 } from 'uuid';

// GET /api/content - List content with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = contentQuerySchema.parse(queryParams) as ContentQueryData;

    const { page, limit, type, status, search, sortBy, sortOrder } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build the base query
    let baseQuery = db
      .select({
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        status: content.status,
        creatorId: content.creatorId,
        timeLimit: content.timeLimit,
        deadline: content.deadline,
        scheduledPublishAt: content.scheduledPublishAt,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
        creatorName: user.name,
        creatorEmail: user.email,
      })
      .from(content)
      .leftJoin(user, eq(content.creatorId, user.id));

    // Apply filters
    const whereConditions = [];

    if (type) {
      whereConditions.push(eq(content.type, type));
    }

    if (status) {
      whereConditions.push(eq(content.status, status));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(content.title, `%${search}%`),
          ilike(content.description, `%${search}%`)
        )
      );
    }

    // Apply where conditions if any
    if (whereConditions.length > 0) {
      baseQuery = baseQuery.where(and(...whereConditions));
    }

    // Apply sorting
    const sortColumn = sortBy === 'title' ? content.title :
                      sortBy === 'updatedAt' ? content.updatedAt :
                      content.createdAt;
    const sortDirection = sortOrder === 'asc' ? asc : desc;
    baseQuery = baseQuery.orderBy(sortDirection(sortColumn));

    // Get total count
    const countQuery = db
      .select({ count: count() })
      .from(content)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const [totalResult] = await countQuery;
    const total = totalResult?.count || 0;

    // Get paginated results
    const contentList = await baseQuery
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      content: contentList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const contentId = uuidv4();

    // Create content transaction
    const result = await db.transaction(async (tx) => {
      // Insert main content
      const [newContent] = await tx
        .insert(content)
        .values({
          id: contentId,
          title: body.title,
          description: body.description || null,
          type: body.type,
          status: body.status || 'draft',
          creatorId: session.user.id,
          timeLimit: body.timeLimit ? parseInt(body.timeLimit) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          scheduledPublishAt: body.scheduledPublishAt ? new Date(body.scheduledPublishAt) : null,
          publishedAt: body.status === 'published' ? new Date() : null,
        })
        .returning();

      // Insert questions if provided
      if (body.questions && body.questions.length > 0) {
        for (let i = 0; i < body.questions.length; i++) {
          const questionData = body.questions[i];
          const questionId = questionData.id || uuidv4();

          // Insert question
          await tx
            .insert(questions)
            .values({
              id: questionId,
              contentId,
              questionText: questionData.questionText,
              type: questionData.type,
              order: questionData.order || i,
              isRequired: questionData.isRequired ?? true,
              points: questionData.points || 1,
              explanation: questionData.explanation || null,
            });

          // Insert options if provided and question type supports options
          if (
            questionData.options &&
            Array.isArray(questionData.options) &&
            questionData.options.length > 0 &&
            (questionData.type === 'single_choice' || questionData.type === 'multiple_choice')
          ) {
            for (let j = 0; j < questionData.options.length; j++) {
              const optionData = questionData.options[j];

              await tx
                .insert(questionOptions)
                .values({
                  id: optionData.id || uuidv4(),
                  questionId,
                  optionText: optionData.optionText,
                  isCorrect: optionData.isCorrect || false,
                  order: optionData.order || j,
                });
            }
          }
        }
      }

      return newContent;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// PUT /api/content - Update existing content
export async function PUT(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Check if content exists and user has permission
    const [existingContent] = await db
      .select()
      .from(content)
      .where(eq(content.id, body.id))
      .limit(1);

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Check if user is the creator or admin
    if (existingContent.creatorId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update this content' },
        { status: 403 }
      );
    }

    // Update content transaction
    const result = await db.transaction(async (tx) => {
      // Update main content
      const [updatedContent] = await tx
        .update(content)
        .set({
          title: body.title,
          description: body.description,
          type: body.type,
          status: body.status,
          timeLimit: body.timeLimit ? parseInt(body.timeLimit) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          scheduledPublishAt: body.scheduledPublishAt ? new Date(body.scheduledPublishAt) : null,
          publishedAt: body.status === 'published' && !existingContent.publishedAt
            ? new Date()
            : existingContent.publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(content.id, body.id))
        .returning();

      // If questions are provided, update them (this is a full replace operation)
      if (body.questions !== undefined) {
        // Delete existing questions and options
        await tx
          .delete(questionOptions)
          .where(
            eq(
              questionOptions.questionId,
              db.select({ id: questions.id }).from(questions).where(eq(questions.contentId, body.id))
            )
          );

        await tx.delete(questions).where(eq(questions.contentId, body.id));

        // Insert new questions
        if (body.questions.length > 0) {
          for (let i = 0; i < body.questions.length; i++) {
            const questionData = body.questions[i];
            const questionId = questionData.id || uuidv4();

            // Insert question
            await tx
              .insert(questions)
              .values({
                id: questionId,
                contentId: body.id,
                questionText: questionData.questionText,
                type: questionData.type,
                order: questionData.order || i,
                isRequired: questionData.isRequired ?? true,
                points: questionData.points || 1,
                explanation: questionData.explanation || null,
              });

            // Insert options if provided and question type supports options
            if (
              questionData.options &&
              Array.isArray(questionData.options) &&
              questionData.options.length > 0 &&
              (questionData.type === 'single_choice' || questionData.type === 'multiple_choice')
            ) {
              for (let j = 0; j < questionData.options.length; j++) {
                const optionData = questionData.options[j];

                await tx
                  .insert(questionOptions)
                  .values({
                    id: optionData.id || uuidv4(),
                    questionId,
                    optionText: optionData.optionText,
                    isCorrect: optionData.isCorrect || false,
                    order: optionData.order || j,
                  });
              }
            }
          }
        }
      }

      return updatedContent;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating content:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// DELETE /api/content - Delete content
export async function DELETE(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Check if content exists and user has permission
    const [existingContent] = await db
      .select()
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Check if user is the creator or admin
    if (existingContent.creatorId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this content' },
        { status: 403 }
      );
    }

    // Delete content transaction (cascade will handle questions and options)
    await db.delete(content).where(eq(content.id, contentId));

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}