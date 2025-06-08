
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET /api/knowledge-base/articles - List articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const publicOnly = searchParams.get('public') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (publicOnly) {
      where.isPublic = true;
      where.status = 'PUBLISHED';
    } else {
      // Check if user is authenticated for non-public access
      const user = await verifyUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (status) where.status = status;
    }

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          tags: true,
          _count: {
            select: { ratings: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.knowledgeBaseArticle.count({ where })
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/knowledge-base/articles - Create article
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, summary, categoryId, tags, isPublic = true } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.knowledgeBaseArticle.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        content,
        summary,
        slug: uniqueSlug,
        categoryId,
        authorId: user.id,
        isPublic,
        status: 'DRAFT',
        tags: tags ? {
          connect: tags.map((tagId: string) => ({ id: tagId }))
        } : undefined
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
