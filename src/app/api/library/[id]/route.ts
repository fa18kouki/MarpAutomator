import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 特定のライブラリアイテムを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.libraryItem.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Library item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to fetch library item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library item' },
      { status: 500 }
    );
  }
}

// PATCH: ライブラリアイテムを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, htmlContent } = body;

    const item = await prisma.libraryItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(htmlContent && { htmlContent }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update library item:', error);
    return NextResponse.json(
      { error: 'Failed to update library item' },
      { status: 500 }
    );
  }
}

// DELETE: ライブラリアイテムを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.libraryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete library item:', error);
    return NextResponse.json(
      { error: 'Failed to delete library item' },
      { status: 500 }
    );
  }
}
