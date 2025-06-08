import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
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

    // For development purposes, we'll simulate file upload
    // In a real app, you would use formData to handle file uploads
    const { name, fileType } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Document name is required' },
        { status: 400 }
      );
    }

    // Check if the case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: params.id },
      select: { id: true }
    });

    if (!caseExists) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Even for development case IDs (starting with 'cm'), we'll store in the database
    // to ensure persistence across sessions

    // In a real app, you would upload the file to storage and save the URL
    // For now, we'll just create a document record in the database
    const document = await prisma.document.create({
      data: {
        filename: name,
        filepath: '#', // In a real app, this would be the actual file path
        filesize: 1024, // Mock file size
        mimetype: fileType || 'application/pdf',
        case: {
          connect: { id: params.id }
        },
        uploader: {
          connect: { id: user.id }
        }
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
