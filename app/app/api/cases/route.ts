
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
// Valid case types and priorities
const VALID_CASE_TYPES = [
  'ACCOUNT_ACCESS',
  'BILLING_ISSUE',
  'TECHNICAL_SUPPORT',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'DISPUTE_HANDLING',
  'PRODUCT_COMPLIANCE',
  'RETURN_FRAUD',
  'INVENTORY_DISPUTE',
  'LOGISTICS_DELIVERY'
] as const;

const VALID_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
  'URGENT'
] as const;

type CaseType = typeof VALID_CASE_TYPES[number];
type Priority = typeof VALID_PRIORITIES[number];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');

    const where: any = {};

    // Role-based filtering
    if (user.role === 'CUSTOMER') {
      where.creatorId = user.id;
    } else if (user.role === 'MERCHANT') {
      // Merchants can see cases assigned to them or cases they need to handle
      where.OR = [
        { assignments: { some: { userId: user.id } } },
        { type: { in: ['DISPUTE_HANDLING', 'PRODUCT_COMPLIANCE', 'RETURN_FRAUD', 'INVENTORY_DISPUTE', 'LOGISTICS_DELIVERY'] } }
      ];
    }
    // Commercial team can see all cases

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;

    const cases = await prisma.case.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true,
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.case.count({ where });

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);
    
    const { title, description, type, priority } = body;

    // Log validation details
    console.log('Validation details:', {
      hasTitle: Boolean(title),
      hasDescription: Boolean(description),
      hasType: Boolean(type),
      receivedType: type,
      receivedPriority: priority,
      validTypes: VALID_CASE_TYPES,
      validPriorities: VALID_PRIORITIES
    });

    // Validate input
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      );
    }

    console.log('Validating case type:', {
      type,
      validTypes: VALID_CASE_TYPES,
      isValid: VALID_CASE_TYPES.includes(type as CaseType)
    });

    if (!VALID_CASE_TYPES.includes(type as CaseType)) {
      return NextResponse.json(
        { error: 'Invalid case type' },
        { status: 400 }
      );
    }

    if (priority && !VALID_PRIORITIES.includes(priority as Priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    const case_ = await prisma.case.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'MEDIUM',
        creatorId: user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(case_, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
