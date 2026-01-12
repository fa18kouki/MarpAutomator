import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 全セッションを取得
export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST: 新しいセッションを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    const session = await prisma.chatSession.create({
      data: {
        title: title || '新しいチャット',
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
