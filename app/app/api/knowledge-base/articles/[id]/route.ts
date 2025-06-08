
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/knowledge-base/articles/[id] - Get article details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true,
        ratings: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if article is public or user has access
    if (!article.isPublic || article.status !== 'PUBLISHED') {
      const user = await verifyUserFromRequest(request);
      if (!user || user.role === 'CUSTOMER') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Increment view count
    await prisma.knowledgeBaseArticle.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/knowledge-base/articles/[id] - Update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, summary, categoryId, tags, isPublic, status } = body;

    const existingArticle = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: params.id }
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check permissions
    const canEdit = user.role === 'COMMERCIAL' || existingArticle.authorId === user.id;
    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED' && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (tags) {
      updateData.tags = {
        set: tags.map((tagId: string) => ({ id: tagId }))
      };
    }

    const updatedArticle = await prisma.knowledgeBaseArticle.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true
      }
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/knowledge-base/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingArticle = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: params.id }
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check permissions
    const canDelete = user.role === 'COMMERCIAL' || existingArticle.authorId === user.id;
    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.knowledgeBaseArticle.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
