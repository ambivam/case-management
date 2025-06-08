
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding enhanced features...');

  // Create ticket categories
  const categories = await Promise.all([
    prisma.ticketCategory.upsert({
      where: { name: 'Technical Support' },
      update: {},
      create: {
        name: 'Technical Support',
        description: 'Technical issues and troubleshooting',
        color: '#3B82F6'
      }
    }),
    prisma.ticketCategory.upsert({
      where: { name: 'Billing & Payments' },
      update: {},
      create: {
        name: 'Billing & Payments',
        description: 'Payment issues and billing inquiries',
        color: '#10B981'
      }
    }),
    prisma.ticketCategory.upsert({
      where: { name: 'Account Management' },
      update: {},
      create: {
        name: 'Account Management',
        description: 'Account settings and profile management',
        color: '#F59E0B'
      }
    }),
    prisma.ticketCategory.upsert({
      where: { name: 'Product Issues' },
      update: {},
      create: {
        name: 'Product Issues',
        description: 'Product defects and quality issues',
        color: '#EF4444'
      }
    }),
    prisma.ticketCategory.upsert({
      where: { name: 'General Inquiry' },
      update: {},
      create: {
        name: 'General Inquiry',
        description: 'General questions and information requests',
        color: '#8B5CF6'
      }
    })
  ]);

  console.log('Created ticket categories:', categories.length);

  // Create ticket tags
  const tags = await Promise.all([
    prisma.ticketTag.upsert({
      where: { name: 'urgent' },
      update: {},
      create: {
        name: 'urgent',
        color: '#DC2626'
      }
    }),
    prisma.ticketTag.upsert({
      where: { name: 'bug' },
      update: {},
      create: {
        name: 'bug',
        color: '#7C2D12'
      }
    }),
    prisma.ticketTag.upsert({
      where: { name: 'feature-request' },
      update: {},
      create: {
        name: 'feature-request',
        color: '#1D4ED8'
      }
    }),
    prisma.ticketTag.upsert({
      where: { name: 'documentation' },
      update: {},
      create: {
        name: 'documentation',
        color: '#059669'
      }
    }),
    prisma.ticketTag.upsert({
      where: { name: 'training' },
      update: {},
      create: {
        name: 'training',
        color: '#7C3AED'
      }
    })
  ]);

  console.log('Created ticket tags:', tags.length);

  // Create SLA rules
  const slaRules = [];
  
  // Check if SLA rules already exist, if not create them
  const existingCritical = await prisma.sLARule.findFirst({
    where: { name: 'Critical Priority SLA' }
  });
  
  if (!existingCritical) {
    const criticalSLA = await prisma.sLARule.create({
      data: {
        name: 'Critical Priority SLA',
        description: 'SLA for critical priority tickets',
        priority: 'CRITICAL',
        responseTime: 30, // 30 minutes
        resolutionTime: 120, // 2 hours
        isActive: true
      }
    });
    slaRules.push(criticalSLA);
  }

  const existingHigh = await prisma.sLARule.findFirst({
    where: { name: 'High Priority SLA' }
  });
  
  if (!existingHigh) {
    const highSLA = await prisma.sLARule.create({
      data: {
        name: 'High Priority SLA',
        description: 'SLA for high priority tickets',
        priority: 'HIGH',
        responseTime: 60, // 1 hour
        resolutionTime: 240, // 4 hours
        isActive: true
      }
    });
    slaRules.push(highSLA);
  }

  const existingMedium = await prisma.sLARule.findFirst({
    where: { name: 'Medium Priority SLA' }
  });
  
  if (!existingMedium) {
    const mediumSLA = await prisma.sLARule.create({
      data: {
        name: 'Medium Priority SLA',
        description: 'SLA for medium priority tickets',
        priority: 'MEDIUM',
        responseTime: 120, // 2 hours
        resolutionTime: 480, // 8 hours
        isActive: true
      }
    });
    slaRules.push(mediumSLA);
  }

  const existingLow = await prisma.sLARule.findFirst({
    where: { name: 'Low Priority SLA' }
  });
  
  if (!existingLow) {
    const lowSLA = await prisma.sLARule.create({
      data: {
        name: 'Low Priority SLA',
        description: 'SLA for low priority tickets',
        priority: 'LOW',
        responseTime: 240, // 4 hours
        resolutionTime: 1440, // 24 hours
        isActive: true
      }
    });
    slaRules.push(lowSLA);
  }

  console.log('Created SLA rules:', slaRules.length);

  // Create article categories
  const articleCategories = await Promise.all([
    prisma.articleCategory.upsert({
      where: { slug: 'getting-started' },
      update: {},
      create: {
        name: 'Getting Started',
        description: 'Basic guides and tutorials for new users',
        slug: 'getting-started',
        sortOrder: 1
      }
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'troubleshooting' },
      update: {},
      create: {
        name: 'Troubleshooting',
        description: 'Common issues and their solutions',
        slug: 'troubleshooting',
        sortOrder: 2
      }
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'account-management' },
      update: {},
      create: {
        name: 'Account Management',
        description: 'Managing your account and profile',
        slug: 'account-management',
        sortOrder: 3
      }
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'billing-payments' },
      update: {},
      create: {
        name: 'Billing & Payments',
        description: 'Payment methods and billing information',
        slug: 'billing-payments',
        sortOrder: 4
      }
    }),
    prisma.articleCategory.upsert({
      where: { slug: 'api-documentation' },
      update: {},
      create: {
        name: 'API Documentation',
        description: 'Technical documentation for developers',
        slug: 'api-documentation',
        sortOrder: 5
      }
    })
  ]);

  console.log('Created article categories:', articleCategories.length);

  // Create article tags
  const articleTags = await Promise.all([
    prisma.articleTag.upsert({
      where: { name: 'beginner' },
      update: {},
      create: {
        name: 'beginner',
        color: '#10B981'
      }
    }),
    prisma.articleTag.upsert({
      where: { name: 'advanced' },
      update: {},
      create: {
        name: 'advanced',
        color: '#DC2626'
      }
    }),
    prisma.articleTag.upsert({
      where: { name: 'tutorial' },
      update: {},
      create: {
        name: 'tutorial',
        color: '#3B82F6'
      }
    }),
    prisma.articleTag.upsert({
      where: { name: 'faq' },
      update: {},
      create: {
        name: 'faq',
        color: '#F59E0B'
      }
    }),
    prisma.articleTag.upsert({
      where: { name: 'video' },
      update: {},
      create: {
        name: 'video',
        color: '#8B5CF6'
      }
    })
  ]);

  console.log('Created article tags:', articleTags.length);

  // Create ticket templates
  const templates = [];
  
  const templateData = [
    {
      name: 'Login Issue',
      title: 'Unable to log into my account',
      description: 'I am experiencing difficulties logging into my account. Please provide the following information:\n\n1. Email address associated with the account\n2. Error message (if any)\n3. Browser and version\n4. Steps you have already tried\n\nWe will investigate and resolve this issue promptly.',
      priority: 'HIGH',
      categoryName: 'Technical Support'
    },
    {
      name: 'Payment Failed',
      title: 'Payment processing failed',
      description: 'Your payment could not be processed. Please provide:\n\n1. Transaction ID or reference number\n2. Payment method used\n3. Amount and currency\n4. Date and time of the transaction\n\nOur billing team will review and assist you with this issue.',
      priority: 'HIGH',
      categoryName: 'Billing & Payments'
    },
    {
      name: 'Feature Request',
      title: 'Request for new feature',
      description: 'Thank you for your feature suggestion! Please provide:\n\n1. Detailed description of the requested feature\n2. Use case and benefits\n3. Priority level for your business\n4. Any specific requirements\n\nOur product team will review your request and provide feedback.',
      priority: 'MEDIUM',
      categoryName: 'General Inquiry'
    },
    {
      name: 'Product Defect',
      title: 'Product quality issue',
      description: 'We apologize for the product issue. Please provide:\n\n1. Product name and model\n2. Purchase date and order number\n3. Description of the defect\n4. Photos or videos (if applicable)\n\nOur quality team will investigate and provide a resolution.',
      priority: 'HIGH',
      categoryName: 'Product Issues'
    }
  ];

  for (const templateInfo of templateData) {
    const existing = await prisma.ticketTemplate.findFirst({
      where: { name: templateInfo.name }
    });
    
    if (!existing) {
      const template = await prisma.ticketTemplate.create({
        data: {
          name: templateInfo.name,
          title: templateInfo.title,
          description: templateInfo.description,
          priority: templateInfo.priority as any,
          categoryId: categories.find(c => c.name === templateInfo.categoryName)?.id
        }
      });
      templates.push(template);
    }
  }

  console.log('Created ticket templates:', templates.length);

  // Get a commercial user to create sample articles
  const commercialUser = await prisma.user.findFirst({
    where: { role: 'COMMERCIAL' }
  });

  if (commercialUser) {
    // Create sample knowledge base articles
    const articles = await Promise.all([
      prisma.knowledgeBaseArticle.upsert({
        where: { slug: 'how-to-create-your-first-case' },
        update: {},
        create: {
          title: 'How to Create Your First Case',
          content: `# How to Create Your First Case

Welcome to our case management system! This guide will walk you through creating your first case.

## Step 1: Navigate to Cases
1. Log into your account
2. Click on "Cases" in the navigation menu
3. Click the "New Case" button

## Step 2: Fill Out Case Details
- **Title**: Provide a clear, descriptive title
- **Description**: Explain the issue in detail
- **Priority**: Select the appropriate priority level
- **Type**: Choose the case type that best fits your situation

## Step 3: Submit Your Case
Once you've filled out all required fields, click "Create Case" to submit.

## What Happens Next?
- You'll receive a confirmation email
- A case number will be assigned
- Our team will review and respond within our SLA timeframes

Need help? Contact our support team at support@example.com`,
          summary: 'Learn how to create your first case in our system',
          slug: 'how-to-create-your-first-case',
          status: 'PUBLISHED',
          isPublic: true,
          authorId: commercialUser.id,
          categoryId: articleCategories.find(c => c.slug === 'getting-started')?.id,
          publishedAt: new Date(),
          viewCount: 45
        }
      }),
      prisma.knowledgeBaseArticle.upsert({
        where: { slug: 'understanding-case-priorities' },
        update: {},
        create: {
          title: 'Understanding Case Priorities',
          content: `# Understanding Case Priorities

Choosing the right priority for your case helps us respond appropriately and efficiently.

## Priority Levels

### Critical
- System is completely down
- Security breach
- Data loss
- **Response Time**: 30 minutes
- **Resolution Time**: 2 hours

### High
- Major functionality not working
- Significant business impact
- **Response Time**: 1 hour
- **Resolution Time**: 4 hours

### Medium
- Minor functionality issues
- Moderate business impact
- **Response Time**: 2 hours
- **Resolution Time**: 8 hours

### Low
- General questions
- Feature requests
- Minor issues
- **Response Time**: 4 hours
- **Resolution Time**: 24 hours

## How to Choose
Consider the impact on your business operations and the urgency of resolution needed.`,
          summary: 'Learn about different case priority levels and when to use them',
          slug: 'understanding-case-priorities',
          status: 'PUBLISHED',
          isPublic: true,
          authorId: commercialUser.id,
          categoryId: articleCategories.find(c => c.slug === 'getting-started')?.id,
          publishedAt: new Date(),
          viewCount: 32
        }
      }),
      prisma.knowledgeBaseArticle.upsert({
        where: { slug: 'troubleshooting-login-issues' },
        update: {},
        create: {
          title: 'Troubleshooting Login Issues',
          content: `# Troubleshooting Login Issues

Having trouble logging in? Try these common solutions.

## Common Solutions

### 1. Check Your Credentials
- Verify your email address is correct
- Ensure caps lock is off
- Try typing your password in a text editor first

### 2. Clear Browser Cache
1. Open your browser settings
2. Find "Clear browsing data" or similar
3. Select "Cached images and files"
4. Clear the cache and try again

### 3. Try Incognito/Private Mode
This helps identify if browser extensions are causing issues.

### 4. Reset Your Password
1. Click "Forgot Password" on the login page
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to create a new password

### 5. Check for Account Lockout
After multiple failed attempts, accounts may be temporarily locked for security.

## Still Having Issues?
If none of these solutions work, please create a support ticket with:
- Your email address
- Browser and version
- Any error messages
- Steps you've already tried`,
          summary: 'Common solutions for login and authentication problems',
          slug: 'troubleshooting-login-issues',
          status: 'PUBLISHED',
          isPublic: true,
          authorId: commercialUser.id,
          categoryId: articleCategories.find(c => c.slug === 'troubleshooting')?.id,
          publishedAt: new Date(),
          viewCount: 78
        }
      })
    ]);

    console.log('Created knowledge base articles:', articles.length);

    // Add tags to articles
    await prisma.knowledgeBaseArticle.update({
      where: { id: articles[0].id },
      data: {
        tags: {
          connect: [
            { id: articleTags.find(t => t.name === 'beginner')?.id },
            { id: articleTags.find(t => t.name === 'tutorial')?.id }
          ]
        }
      }
    });

    await prisma.knowledgeBaseArticle.update({
      where: { id: articles[1].id },
      data: {
        tags: {
          connect: [
            { id: articleTags.find(t => t.name === 'beginner')?.id },
            { id: articleTags.find(t => t.name === 'faq')?.id }
          ]
        }
      }
    });

    await prisma.knowledgeBaseArticle.update({
      where: { id: articles[2].id },
      data: {
        tags: {
          connect: [
            { id: articleTags.find(t => t.name === 'tutorial')?.id },
            { id: articleTags.find(t => t.name === 'faq')?.id }
          ]
        }
      }
    });
  }

  console.log('Enhanced features seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
