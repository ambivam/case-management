import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch analytics data
    const [
      totalCases,
      openCases,
      resolvedCases,
      totalArticles,
      publishedArticles,
      totalUsers
    ] = await Promise.all([
      // Total cases
      prisma.case.count(),
      // Open cases (OPEN, IN_PROGRESS, PENDING_CUSTOMER)
      prisma.case.count({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER']
          }
        }
      }),
      // Resolved cases
      prisma.case.count({
        where: {
          status: 'RESOLVED'
        }
      }),
      // Total knowledge base articles
      prisma.knowledgeBaseArticle.count(),
      // Published articles
      prisma.knowledgeBaseArticle.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      // Total users
      prisma.user.count()
    ]);

    // Get case resolution time stats
    const caseStats = await prisma.case.findMany({
      where: {
        status: 'RESOLVED'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    // Calculate average resolution time in hours
    const avgResolutionTime = caseStats.length > 0
      ? caseStats.reduce((acc, curr) => {
          const resolutionTime = new Date(curr.updatedAt).getTime() - new Date(curr.createdAt).getTime();
          return acc + (resolutionTime / (1000 * 60 * 60)); // Convert to hours
        }, 0) / caseStats.length
      : 0;

    // Get case categories distribution
    const categoryDistribution = await prisma.case.groupBy({
      by: ['type'],
      _count: true
    });

    return NextResponse.json({
      overview: {
        totalCases,
        openCases,
        resolvedCases,
        resolutionRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
        avgResolutionTimeHours: avgResolutionTime,
        totalArticles,
        publishedArticles,
        totalUsers
      },
      categoryDistribution: categoryDistribution.map(cat => ({
        type: cat.type,
        count: cat._count
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
