import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contentDrafts, content } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireRole } from '@/lib/server-auth';
import { contentDraftSchema } from '@/lib/schemas/content';
import { v4 as uuidv4 } from 'uuid';

// GET /api/content/drafts - List user's drafts
export async function GET(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    let whereCondition = eq(contentDrafts.creatorId, session.user.id);

    if (contentId) {
      whereCondition = and(whereCondition, eq(contentDrafts.contentId, contentId));
    }

    const drafts = await db
      .select({
        id: contentDrafts.id,
        contentId: contentDrafts.contentId,
        creatorId: contentDrafts.creatorId,
        draftData: contentDrafts.draftData,
        lastSavedAt: contentDrafts.lastSavedAt,
        createdAt: contentDrafts.createdAt,
      })
      .from(contentDrafts)
      .where(whereCondition)
      .orderBy(desc(contentDrafts.lastSavedAt));

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST /api/content/drafts - Save or update a draft
export async function POST(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const body = await request.json();

    // Validate the draft data
    const validatedData = contentDraftSchema.parse(body);

    // Check if a draft already exists for this content and user
    const existingDraft = await db
      .select()
      .from(contentDrafts)
      .where(
        and(
          validatedData.contentId
            ? eq(contentDrafts.contentId, validatedData.contentId)
            : eq(contentDrafts.contentId, ''),
          eq(contentDrafts.creatorId, session.user.id)
        )
      )
      .limit(1);

    let result;

    if (existingDraft.length > 0) {
      // Update existing draft
      const [updatedDraft] = await db
        .update(contentDrafts)
        .set({
          draftData: validatedData.draftData,
          lastSavedAt: new Date(),
        })
        .where(eq(contentDrafts.id, existingDraft[0].id))
        .returning();

      result = updatedDraft;
    } else {
      // Create new draft
      const draftId = uuidv4();
      const [newDraft] = await db
        .insert(contentDrafts)
        .values({
          id: draftId,
          contentId: validatedData.contentId || null,
          creatorId: session.user.id,
          draftData: validatedData.draftData,
          lastSavedAt: new Date(),
          createdAt: new Date(),
        })
        .returning();

      result = newDraft;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving draft:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// DELETE /api/content/drafts - Delete a draft
export async function DELETE(request: NextRequest) {
  try {
    // Require manager or admin role
    const session = await requireRole(['manager', 'admin']);

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Check if draft exists and belongs to user
    const [existingDraft] = await db
      .select()
      .from(contentDrafts)
      .where(eq(contentDrafts.id, draftId))
      .limit(1);

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (existingDraft.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this draft' },
        { status: 403 }
      );
    }

    await db.delete(contentDrafts).where(eq(contentDrafts.id, draftId));

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}