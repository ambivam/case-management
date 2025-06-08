
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET /api/knowledge-base/categories - List article categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.articleCategory.findMany({
      where: { parentId: null, isActive: true },
      include: {
        _count: {
          select: { 
            articles: {
              where: { status: 'PUBLISHED', isPublic: true }
            }
          }
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { 
                articles: {
                  where: { status: 'PUBLISHED', isPublic: true }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/knowledge-base/categories - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role !== 'COMMERCIAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, parentId, sortOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.articleCategory.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await prisma.articleCategory.create({
      data: {
        name,
        description,
        slug: uniqueSlug,
        parentId,
        sortOrder
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
