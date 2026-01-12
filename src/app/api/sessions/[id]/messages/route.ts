import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// MessageRole enum values
type MessageRole = 'user' | 'assistant';

// POST: メッセージを追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { role, content } = body;

    // セッションの存在確認
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // メッセージを作成
    const message = await prisma.message.create({
      data: {
        sessionId,
        role: role as MessageRole,
        content,
      },
    });

    // セッションの更新日時を更新
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
