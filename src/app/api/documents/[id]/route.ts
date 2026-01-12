import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 特定のドキュメントを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        libraryItem: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PATCH: ドキュメントを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, marpContent, htmlContent } = body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(marpContent && { marpContent }),
        ...(htmlContent && { htmlContent }),
      },
    });

    // 関連するライブラリアイテムも更新
    if (title || htmlContent) {
      await prisma.libraryItem.updateMany({
        where: { documentId: id },
        data: {
          ...(title && { title }),
          ...(htmlContent && { htmlContent }),
        },
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE: ドキュメントを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
