
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyUserFromRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET /api/sla/rules - List SLA rules
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await prisma.sLARule.findMany({
      include: {
        category: true
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching SLA rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sla/rules - Create SLA rule (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user || user.role !== 'COMMERCIAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, priority, responseTime, resolutionTime, categoryId } = body;

    if (!name || !priority || !responseTime || !resolutionTime) {
      return NextResponse.json({ 
        error: 'Name, priority, response time, and resolution time are required' 
      }, { status: 400 });
    }

    const rule = await prisma.sLARule.create({
      data: {
        name,
        description,
        priority,
        responseTime,
        resolutionTime,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating SLA rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
