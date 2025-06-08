
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/sla/metrics - Get SLA performance metrics
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get tickets created in the specified period
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        category: true
      }
    });

    // Calculate metrics
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const breachedTickets = tickets.filter(t => t.slaBreached).length;
    
    const slaCompliance = totalTickets > 0 ? ((totalTickets - breachedTickets) / totalTickets) * 100 : 100;
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    // Average resolution time for resolved tickets
    const resolvedWithTimes = tickets.filter(t => t.resolvedAt && t.createdAt);
    const avgResolutionTime = resolvedWithTimes.length > 0 
      ? resolvedWithTimes.reduce((sum, ticket) => {
          const resolutionTime = ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedWithTimes.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Tickets at risk (SLA due within 2 hours)
    const atRiskTickets = await prisma.ticket.count({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        slaDueDate: {
          lte: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
        }
      }
    });

    // Priority breakdown
    const priorityBreakdown = await prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Category performance
    const categoryPerformance = await prisma.ticket.groupBy({
      by: ['categoryId'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    });

    return NextResponse.json({
      overview: {
        totalTickets,
        resolvedTickets,
        breachedTickets,
        atRiskTickets,
        slaCompliance: Math.round(slaCompliance * 100) / 100,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100
      },
      priorityBreakdown,
      categoryPerformance
    });
  } catch (error) {
    console.error('Error fetching SLA metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
