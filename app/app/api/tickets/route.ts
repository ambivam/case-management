
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();



// GET /api/tickets - List tickets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: Prisma.TicketWhereInput = {};

    // Role-based filtering
    if (user.role === 'Customer') {
      where.creatorId = user.id;
    } else if (user.role === 'Merchant') {
      // Merchants can see tickets assigned to them or created by their customers
      where.OR = [
        { assigneeId: user.id },
        { creator: { role: 'Customer' } }
      ];
    }
    // COMMERCIAL users can see all tickets

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignee: { select: { id: true, name: true, email: true, role: true } },
          category: true,
          tags: true,
          _count: {
            select: {
              messages: true,
              documents: true
            }
          }
        }
      }),
      prisma.ticket.count({ where })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, categoryId, tags } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Calculate SLA due date based on priority and category
    let slaDueDate = null;
    if (categoryId && priority) {
      const slaRule = await prisma.sLARule.findFirst({
        where: {
          categoryId,
          priority,
          isActive: true
        }
      });

      if (slaRule) {
        slaDueDate = new Date(Date.now() + slaRule.resolutionTime * 60 * 1000);
      }
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'Medium',
        categoryId,
        creatorId: user.id,
        slaDueDate,
        tags: tags ? {
          connect: tags.map((tagId: string) => ({ id: tagId }))
        } : undefined
      },
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        tags: true
      }
    });

    // Create initial activity
    await prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        action: 'CREATED',
        description: 'Ticket created',
        metadata: JSON.stringify({
          priority,
          categoryId
        })
      }
    });

    // Auto-assign based on category rules (simplified logic)
    if (categoryId && !ticket.assigneeId) {
      const availableAgent = await prisma.user.findFirst({
        where: {
          role: { in: ['Merchant', 'Commercial'] } as Prisma.UserWhereInput['role']
        }
      });

      if (availableAgent) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { assigneeId: availableAgent.id }
        });

        await prisma.ticketActivity.create({
          data: {
            ticketId: ticket.id,
            userId: null,
            action: 'ASSIGNED',
            description: `Auto-assigned to ${availableAgent.name}`,
            metadata: { assigneeId: availableAgent.id }
          }
        });
      }
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
