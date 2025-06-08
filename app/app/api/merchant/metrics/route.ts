
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CaseType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get merchant-specific metrics
    const merchantCaseTypes: CaseType[] = ['DISPUTE_HANDLING', 'PRODUCT_COMPLIANCE', 'RETURN_FRAUD', 'INVENTORY_DISPUTE', 'LOGISTICS_DELIVERY'];
    
    const totalCases = await prisma.case.count({
      where: {
        type: { in: merchantCaseTypes }
      }
    });

    const pendingCases = await prisma.case.count({
      where: {
        type: { in: merchantCaseTypes },
        status: 'PENDING_MERCHANT'
      }
    });

    const resolvedCases = await prisma.case.count({
      where: {
        type: { in: merchantCaseTypes },
        status: { in: ['RESOLVED', 'CLOSED'] }
      }
    });

    const escalatedCases = await prisma.case.count({
      where: {
        type: { in: merchantCaseTypes },
        status: 'ESCALATED'
      }
    });

    const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

    // Get case distribution by type
    const casesByType = await prisma.case.groupBy({
      by: ['type'],
      where: {
        type: { in: merchantCaseTypes }
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      totalCases,
      pendingCases,
      resolvedCases,
      escalatedCases,
      resolutionRate,
      casesByType
    });
  } catch (error) {
    console.error('Error fetching merchant metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
