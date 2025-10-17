import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    let query = db.select().from(user);
    
    if (search) {
      query = query.where(
        eq(user.email, search)
      );
    }
    
    const users = await query
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);
    
    const totalUsers = await db.select().from(user);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers.length,
        totalPages: Math.ceil(totalUsers.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }
    
    const updatedUser = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();
    
    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}