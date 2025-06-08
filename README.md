
# Case Management System

A comprehensive role-based case management application built with Next.js, TypeScript, and Prisma. This system provides different dashboards and functionality for Customers, Merchants, and Commercial Teams to efficiently manage and track cases.

## 🚀 Project Overview

### Key Features
- **Role-Based Authentication**: Secure login system with three user roles (Customer, Merchant, Commercial Team)
- **Role-Specific Dashboards**: Customized interfaces for each user type
- **Case Management**: Create, track, and manage cases with status updates
- **Dark/Light Mode**: Toggle between themes for better user experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Dynamic case status tracking and notifications
- **Secure API**: Protected routes with JWT authentication

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm** or **yarn**: Package manager (yarn recommended)
- **Git**: For cloning the repository

### System Requirements
- Operating System: Windows, macOS, or Linux
- RAM: Minimum 4GB recommended
- Storage: At least 500MB free space

## 🛠️ Installation Instructions

### 1. Clone or Download the Project
If you have the project files, navigate to the project directory:
```bash
cd /home/ubuntu/case-management-system
```

### 2. Install Dependencies
Navigate to the app directory and install dependencies:
```bash
cd app
yarn install
# or
npm install
```

## 🗄️ Database Setup

### 1. Environment Variables
The application uses SQLite, so no additional database server setup is required. The database file will be created automatically.

### 2. Generate Prisma Client
```bash
cd app
npx prisma generate
```

### 3. Initialize Database
Create and migrate the database:
```bash
npx prisma db push
```

### 4. Verify Database Setup
Check if the database was created successfully:
```bash
npx prisma studio
```
This will open Prisma Studio in your browser at `http://localhost:5555` where you can view and manage your database.

## 🚀 Running the Application

### Development Mode
Start the development server:
```bash
cd app
yarn dev
# or
npm run dev
```

The application will be available at: **http://localhost:3000**

### Production Build
To build the application for production:
```bash
cd app
yarn build
yarn start
# or
npm run build
npm start
```

### Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## 👥 User Accounts and Testing

### Creating Test Accounts
You can create test accounts through the registration page at `http://localhost:3000/register` or create them programmatically:

### User Roles and Access Levels

#### 1. **Customer Role**
- Access to customer dashboard (`/customer`)
- Can create and view their own cases
- Case status tracking
- Profile management

#### 2. **Merchant Role**
- Access to merchant dashboard (`/merchant`)
- Can view and manage merchant-related cases
- Enhanced case management tools
- Analytics and reporting

#### 3. **Commercial Team Role**
- Access to commercial dashboard (`/commercial`)
- Full case management capabilities
- User management features
- System administration tools

### Default Test Credentials
After setting up the database, you can create test users with these roles through the registration page.

## ✨ Features Overview

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Session management

### Dashboard Features
- **Customer Dashboard**: Personal case management, status tracking
- **Merchant Dashboard**: Business case handling, merchant tools
- **Commercial Dashboard**: Administrative functions, system overview

### Case Management
- Create new cases with detailed information
- Track case status and progress
- Update case details and notes
- Role-based case visibility

### User Interface
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean design with Radix UI components
- **Smooth Animations**: Enhanced user experience with Framer Motion

### Key Pages
- `/` - Landing page with system overview
- `/login` - User authentication
- `/register` - New user registration
- `/get-started` - Onboarding guide
- `/learn-more` - Detailed feature information
- `/customer` - Customer dashboard
- `/merchant` - Merchant dashboard
- `/commercial` - Commercial team dashboard

## 📁 Project Structure

```
case-management-system/
├── app/                          # Main application directory
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── cases/           # Case management endpoints
│   │   │   ├── commercial/      # Commercial team endpoints
│   │   │   └── merchant/        # Merchant endpoints
│   │   ├── customer/            # Customer dashboard pages
│   │   ├── merchant/            # Merchant dashboard pages
│   │   ├── commercial/          # Commercial dashboard pages
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── get-started/         # Onboarding page
│   │   ├── learn-more/          # Information page
│   │   └── globals.css          # Global styles
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # UI component library
│   │   ├── layout/              # Layout components
│   │   └── theme-provider.tsx   # Theme management
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── db.ts                # Database connection
│   │   └── utils.ts             # General utilities
│   ├── prisma/                  # Database schema and migrations
│   │   └── schema.prisma        # Database schema
│   ├── middleware.ts            # Next.js middleware for auth
│   └── package.json             # Dependencies and scripts
└── README.md                    # This file
```

### Important Files
- `middleware.ts` - Handles authentication and route protection
- `lib/auth.ts` - JWT token management and user authentication
- `prisma/schema.prisma` - Database schema definition
- `components/ui/` - Reusable UI components built with Radix UI

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**
If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
yarn dev -p 3001
```

#### 2. **Database Connection Issues**
If you encounter database errors:
```bash
# Reset the database
cd app
rm prisma/dev.db
npx prisma db push
npx prisma generate
```

#### 3. **Module Not Found Errors**
If you get module import errors:
```bash
# Clear node_modules and reinstall
cd app
rm -rf node_modules
rm yarn.lock  # or package-lock.json
yarn install  # or npm install
```

#### 4. **TypeScript Compilation Errors**
Check for TypeScript issues:
```bash
cd app
npx tsc --noEmit
```

#### 5. **Prisma Client Issues**
If Prisma client is not working:
```bash
cd app
npx prisma generate
```

### Environment Issues
- Ensure Node.js version is 18.0 or higher
- Make sure you're in the correct directory (`app/`) when running commands
- Check that all dependencies are installed correctly

### Browser Issues
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for JavaScript errors

## 📝 Additional Information

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Implement proper error handling
- Write descriptive commit messages

### Security Considerations
- JWT tokens are used for authentication
- Passwords are hashed with bcrypt
- Role-based access control is enforced
- API routes are protected with middleware

### Performance Optimization
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for better performance
- Efficient database queries with Prisma

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Support
For issues or questions:
- Check the troubleshooting section above
- Review the project documentation
- Check existing issues in the project repository

### License
This project is for educational and demonstration purposes.

---

## 🎯 Quick Start Summary

1. **Install dependencies**: `cd app && yarn install`
2. **Setup database**: `npx prisma generate && npx prisma db push`
3. **Start development server**: `yarn dev`
4. **Open browser**: Navigate to `http://localhost:3000`
5. **Create account**: Register a new user account
6. **Explore features**: Test different user roles and functionality

Happy coding! 🚀
