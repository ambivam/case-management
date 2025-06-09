import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Find the case first to check permissions
    const existingCase = await prisma.case.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          where: { userId: user.id }
        }
      }
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this case
    const hasPermission =
      user.role === 'COMMERCIAL' ||
      user.role === 'MERCHANT' ||
      existingCase.creatorId === user.id ||
      existingCase.assignments.length > 0;

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update this case' },
        { status: 403 }
      );
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        type: data.type,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First try to fetch the actual case from the database
    try {
      const caseData = await prisma.case.findUnique({
        where: {
          id: params.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          documents: {
            include: {
              uploader: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              messages: true,
              documents: true,
            },
          },
        },
      });

      // If we found the case in the database, return it
      if (caseData) {
        // Check if the user has permission to view this case
        const hasPermission = 
          user.role === 'COMMERCIAL' || 
          user.role === 'MERCHANT' ||
          caseData.creatorId === user.id ||
          (caseData.assignments && 
           Array.isArray(caseData.assignments) && 
           caseData.assignments.some((assignment) => assignment.userId === user.id));

        if (!hasPermission) {
          return NextResponse.json(
            { error: 'You do not have permission to view this case' },
            { status: 403 }
          );
        }

        return NextResponse.json(caseData);
      }
    } catch (dbError) {
      console.error('Database error when fetching case:', dbError);
      // Continue to mock data if database query fails
    }
    
    // If the case ID starts with 'cm', it might be a mock case that needs to be created in the database
    if (params.id.startsWith('cm')) {
      try {
        // Generate mock data for this case
        const mockData = getMockCaseData(params.id, user.id);
        
        // Check if this mock case already exists in the database
        const existingCase = await prisma.case.findUnique({
          where: { id: params.id },
        });
        
        // If it doesn't exist, create it
        if (!existingCase) {
          const newCase = await prisma.case.create({
            data: {
              id: params.id,
              title: mockData.title,
              description: mockData.description,
              status: mockData.status as any,
              priority: mockData.priority as any,
              type: mockData.type as any,
              creator: {
                connect: { id: user.id }
              }
            },
          });
          
          // Create initial message
          await prisma.message.create({
            data: {
              content: mockData.description,
              case: {
                connect: { id: params.id }
              },
              author: {
                connect: { id: user.id }
              }
            }
          });
          
          // Now fetch the newly created case with all related data
          const createdCase = await prisma.case.findUnique({
            where: { id: params.id },
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              assignments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      role: true,
                    },
                  },
                },
              },
              messages: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
              documents: {
                include: {
                  uploader: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
              _count: {
                select: {
                  messages: true,
                  documents: true,
                },
              },
            },
          });
          
          return NextResponse.json(createdCase);
        }
      } catch (error) {
        console.error('Error creating mock case in database:', error);
      }
    }
    
    // Fall back to mock data if the case wasn't found in the database
    // or if there was a database error
    return NextResponse.json(getMockCaseData(params.id, user.id));

  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    );
  }
}

// Mock data function for development
function getMockCaseData(id: string, userId: string) {
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);
  
  const twoDaysFromNow = new Date(now);
  twoDaysFromNow.setDate(now.getDate() + 2);

  // Generate case-specific data based on the ID
  const idHash = id.slice(-6); // Use last 6 chars of ID for variety
  const caseTypes = ['ORDER_ISSUE', 'PAYMENT_REFUND', 'ACCOUNT_ACCESS', 'SERVICE_DISSATISFACTION', 'DISPUTE_HANDLING'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_MERCHANT', 'ESCALATED'];
  
  // Use the hash to deterministically select case properties
  const hashNum = parseInt(idHash, 16);
  const caseType = caseTypes[hashNum % caseTypes.length];
  const priority = priorities[(hashNum >> 4) % priorities.length];
  const status = statuses[(hashNum >> 8) % statuses.length];
  
  // Generate a title and description based on the case type
  let title = '';
  let description = '';
  
  switch(caseType) {
    case 'ORDER_ISSUE':
      title = `Order #${idHash} Delivery Delay`;
      description = `My order #${idHash} was supposed to be delivered on ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} but I still haven't received it. Please check the status and provide an update.`;
      break;
    case 'PAYMENT_REFUND':
      title = `Refund Request for Transaction #${idHash}`;
      description = `I would like to request a refund for my purchase (Transaction ID: ${idHash}). The product doesn't meet my expectations as described on the website.`;
      break;
    case 'ACCOUNT_ACCESS':
      title = `Unable to Access Account Settings`;
      description = `I'm having trouble accessing my account settings page. Every time I try to update my profile information, I get an error message saying "Operation failed".`;
      break;
    case 'SERVICE_DISSATISFACTION':
      title = `Complaint about Customer Service Experience`;
      description = `I had a very disappointing experience with your customer service representative on ${new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}. The representative was unhelpful and rude when I tried to explain my issue.`;
      break;
    case 'DISPUTE_HANDLING':
      title = `Dispute for Incorrect Charges on Order #${idHash}`;
      description = `I was charged incorrectly for my recent order #${idHash}. The invoice shows items I didn't purchase, and the total amount is higher than what was displayed during checkout.`;
      break;
    default:
      title = `Case #${id}`;
      description = `This is case #${id} with details pending review.`;
  }

  return {
    id,
    title,
    description,
    status,
    priority,
    type: caseType,
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: now.toISOString(),
    slaDueDate: twoDaysFromNow.toISOString(),
    slaBreached: false,
    creator: {
      id: userId,
      name: 'Development User',
      email: 'dev@example.com',
      role: 'CUSTOMER',
    },
    assignments: [
      {
        id: `assignment-${idHash}`,
        role: 'ASSIGNEE',
        assignedAt: now.toISOString(),
        user: {
          id: 'support-1',
          name: 'Support Agent',
          email: 'support@example.com',
          role: 'MERCHANT',
        }
      }
    ],
    tags: [
      {
        id: `tag-${idHash}-1`,
        name: priority === 'HIGH' || priority === 'CRITICAL' ? 'Urgent' : 'Standard',
        color: priority === 'HIGH' || priority === 'CRITICAL' ? '#e74c3c' : '#3498db',
      },
      {
        id: `tag-${idHash}-2`,
        name: caseType.replace('_', ' ').toLowerCase(),
        color: '#f39c12',
      },
    ],
    _count: {
      messages: 2,
      documents: 1,
    },
    messages: [
      {
        id: `msg-${idHash}-1`,
        content: description,
        createdAt: threeDaysAgo.toISOString(),
        user: {
          id: userId,
          name: 'Development User',
          role: 'CUSTOMER',
        },
      },
      {
        id: `msg-${idHash}-2`,
        content: `Thank you for contacting us about this ${caseType.toLowerCase().replace('_', ' ')} issue. Our team is investigating and will get back to you shortly.`,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'support-1',
          name: 'Support Agent',
          role: 'MERCHANT',
        },
      },
    ],
    documents: [
      {
        id: `doc-${idHash}`,
        name: caseType === 'ORDER_ISSUE' ? 'order_receipt.pdf' : 
              caseType === 'PAYMENT_REFUND' ? 'transaction_details.pdf' : 
              'case_evidence.png',
        url: '#',
        createdAt: threeDaysAgo.toISOString(),
        user: {
          id: userId,
          name: 'Development User',
          role: 'CUSTOMER',
        },
      },
    ],
  };
}
