
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/tickets/[id] - Get ticket details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        template: true,
        tags: true,
        messages: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        documents: {
          include: {
            uploader: { select: { id: true, name: true, email: true } }
          }
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess = 
      user.role === 'COMMERCIAL' ||
      ticket.creatorId === user.id ||
      ticket.assigneeId === user.id ||
      (user.role === 'MERCHANT' && ticket.creator.role === 'CUSTOMER');

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Update ticket request body:', body);
    const { status, priority, assigneeId, categoryId, tags, title, description } = body;

    // Validate required fields
    if (!status || !priority) {
      return NextResponse.json({ error: 'Status and priority are required' }, { status: 400 });
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { creator: true, assignee: true }
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions
    const canUpdate = 
      user.role === 'COMMERCIAL' ||
      existingTicket.creatorId === user.id ||
      existingTicket.assigneeId === user.id ||
      (user.role === 'MERCHANT' && existingTicket.creator.role === 'CUSTOMER');

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    const activities: any[] = [];

    // Handle optional text fields
    if (typeof title === 'string') updateData.title = title;
    if (typeof description === 'string') updateData.description = description;

    if (typeof status === 'string' && status !== existingTicket.status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      } else if (status === 'CLOSED') {
        updateData.closedAt = new Date();
      }
      activities.push({
        action: 'STATUS_CHANGED',
        description: `Status changed from ${existingTicket.status} to ${status}`,
        metadata: { oldStatus: existingTicket.status, newStatus: status }
      });
    }

    if (typeof priority === 'string' && priority !== existingTicket.priority) {
      updateData.priority = priority;
      activities.push({
        action: 'PRIORITY_CHANGED',
        description: `Priority changed from ${existingTicket.priority} to ${priority}`,
        metadata: { oldPriority: existingTicket.priority, newPriority: priority }
      });
    }

    if ((assigneeId === null || typeof assigneeId === 'string') && assigneeId !== existingTicket.assigneeId) {
      updateData.assigneeId = assigneeId;
      const assignee = assigneeId ? await prisma.user.findUnique({ where: { id: assigneeId } }) : null;
      activities.push({
        action: 'ASSIGNED',
        description: assigneeId 
          ? `Assigned to ${assignee?.name}` 
          : 'Unassigned',
        metadata: { assigneeId, assigneeName: assignee?.name }
      });
    }

    if (categoryId === null || typeof categoryId === 'string') updateData.categoryId = categoryId;

    // Handle tags update
    if (Array.isArray(tags)) {
      updateData.tags = {
        set: tags.length > 0 ? tags.map((tagId: string) => ({ id: tagId })) : []
      };
    }

    console.log('Updating ticket with data:', updateData);

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        tags: true
      }
    });

    // Create activities
    for (const activity of activities) {
      await prisma.ticketActivity.create({
        data: {
          ticketId: params.id,
          userId: user.id,
          action: activity.action,
          description: activity.description,
          metadata: activity.metadata ? JSON.stringify(activity.metadata) : undefined
        }
      });
    }

    console.log('Ticket updated successfully:', updatedTicket);
    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tickets/[id] - Delete ticket (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role !== 'COMMERCIAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.ticket.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
