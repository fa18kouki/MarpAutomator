import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Document type for API responses
interface DocumentRecord {
  id: string;
  title: string;
  marpContent: string;
  htmlContent: string;
  presetId?: string;
  templateIds: string[];
  chatSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET: 全ドキュメントを取得
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST: 新しいドキュメントを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, marpContent, htmlContent, presetId, templateIds, chatSessionId } = body;

    // ドキュメントを作成
    const document = await prisma.document.create({
      data: {
        title,
        marpContent,
        htmlContent,
        presetId,
        templateIds: templateIds || [],
        chatSessionId,
      },
    }) as DocumentRecord;

    // ライブラリアイテムも同時に作成
    await prisma.libraryItem.create({
      data: {
        title,
        type: 'document',
        htmlContent,
        documentId: document.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
