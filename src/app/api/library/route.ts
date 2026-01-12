import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// LibraryItemType enum values
type LibraryItemType = 'document' | 'uploaded_html';

// GET: 全ライブラリアイテムを取得
export async function GET() {
  try {
    const items = await prisma.libraryItem.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        document: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch library items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library items' },
      { status: 500 }
    );
  }
}

// POST: 新しいライブラリアイテムを作成（HTMLアップロード用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, htmlContent, type } = body;

    const item = await prisma.libraryItem.create({
      data: {
        title,
        htmlContent,
        type: (type as LibraryItemType) || 'uploaded_html',
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create library item:', error);
    return NextResponse.json(
      { error: 'Failed to create library item' },
      { status: 500 }
    );
  }
}
