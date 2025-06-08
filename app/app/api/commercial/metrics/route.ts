
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'COMMERCIAL') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get comprehensive metrics for commercial team
    const totalCases = await prisma.case.count();
    
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const casesByPriority = await prisma.case.groupBy({
      by: ['priority'],
      _count: {
        id: true
      }
    });

    const casesByType = await prisma.case.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    // Calculate SLA violations (cases older than 7 days and not resolved)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const slaViolations = await prisma.case.count({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        },
        status: {
          notIn: ['RESOLVED', 'CLOSED']
        }
      }
    });

    // Get user distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    const resolvedCount = casesByStatus.find(s => s.status === 'RESOLVED')?._count.id || 0;
    const closedCount = casesByStatus.find(s => s.status === 'CLOSED')?._count.id || 0;
    const resolutionRate = totalCases > 0 ? Math.round((resolvedCount + closedCount) / totalCases * 100) : 0;

    return NextResponse.json({
      totalCases,
      casesByStatus,
      casesByPriority,
      casesByType,
      slaViolations,
      usersByRole,
      resolutionRate
    });
  } catch (error) {
    console.error('Error fetching commercial metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
