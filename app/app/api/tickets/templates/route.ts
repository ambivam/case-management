
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/tickets/templates - List ticket templates
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.ticketTemplate.findMany({
      where: { isActive: true },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/templates - Create template (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role !== 'COMMERCIAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, description, priority, categoryId } = body;

    if (!name || !title || !description) {
      return NextResponse.json({ 
        error: 'Name, title, and description are required' 
      }, { status: 400 });
    }

    const template = await prisma.ticketTemplate.create({
      data: {
        name,
        title,
        description,
        priority: priority || 'MEDIUM',
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
