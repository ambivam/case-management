
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/tickets/[id]/messages - Get ticket messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ticket access
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { creator: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const hasAccess = 
      user.role === 'COMMERCIAL' ||
      ticket.creatorId === user.id ||
      ticket.assigneeId === user.id ||
      (user.role === 'MERCHANT' && ticket.creator.role === 'CUSTOMER');

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await prisma.ticketMessage.findMany({
      where: { 
        ticketId: params.id,
        // Hide internal messages from customers
        ...(user.role === 'CUSTOMER' ? { isInternal: false } : {})
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, isInternal = false } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Check ticket access
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { creator: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const hasAccess = 
      user.role === 'COMMERCIAL' ||
      ticket.creatorId === user.id ||
      ticket.assigneeId === user.id ||
      (user.role === 'MERCHANT' && ticket.creator.role === 'CUSTOMER');

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Customers cannot send internal messages
    const messageIsInternal = user.role === 'CUSTOMER' ? false : isInternal;

    const message = await prisma.ticketMessage.create({
      data: {
        content: content.trim(),
        isInternal: messageIsInternal,
        ticketId: params.id,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    // Update ticket status if it was pending customer response
    if (ticket.status === 'PENDING_CUSTOMER' && user.role === 'CUSTOMER') {
      await prisma.ticket.update({
        where: { id: params.id },
        data: { status: 'OPEN' }
      });
    }

    // Create activity
    await prisma.ticketActivity.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        action: 'MESSAGE_ADDED',
        description: messageIsInternal ? 'Internal note added' : 'Message added',
        metadata: JSON.stringify({ messageId: message.id, isInternal: messageIsInternal })
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
