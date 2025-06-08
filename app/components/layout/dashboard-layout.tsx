
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Shield, LogOut, User, Bell, Menu, Home, FileText, Ticket, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      fetchCurrentUser();
    }
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({
        title: 'Logged out successfully',
        description: 'See you next time!',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return 'bg-blue-600';
      case 'MERCHANT':
        return 'bg-green-600';
      case 'COMMERCIAL':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return 'Customer';
      case 'MERCHANT':
        return 'Merchant';
      case 'COMMERCIAL':
        return 'Commercial Team';
      default:
        return role;
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: currentUser?.role === 'CUSTOMER' ? '/customer' : 
              currentUser?.role === 'MERCHANT' ? '/merchant' : '/commercial',
        icon: Home,
        current: pathname === '/customer' || pathname === '/merchant' || pathname === '/commercial'
      },
      {
        name: 'Cases',
        href: '/cases',
        icon: FileText,
        current: pathname.startsWith('/cases')
      },
      {
        name: 'Support Tickets',
        href: '/tickets',
        icon: Ticket,
        current: pathname.startsWith('/tickets')
      }
    ];

    // Add role-specific items
    if (currentUser?.role === 'COMMERCIAL' || currentUser?.role === 'MERCHANT') {
      baseItems.push(
        {
          name: 'Knowledge Base',
          href: '/knowledge-base',
          icon: BookOpen,
          current: pathname.startsWith('/knowledge-base')
        },
        {
          name: 'SLA Management',
          href: '/sla',
          icon: Clock,
          current: pathname.startsWith('/sla')
        }
      );
    }

    if (currentUser?.role === 'COMMERCIAL') {
      baseItems.push({
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        current: pathname.startsWith('/analytics')
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 p-6 border-b">
        <Shield className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">CaseFlow</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <header className={`${currentUser ? getRoleColor(currentUser.role) : 'bg-blue-600'} text-white shadow-lg sticky top-0 z-50`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-lg font-bold">CaseFlow</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {currentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-white/20 text-white">
                            {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block lg:pl-64">
        <header className="bg-card border-b shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-foreground">
                  {navigationItems.find(item => item.current)?.name || 'Dashboard'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {currentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <div className="text-sm font-medium">{currentUser.name}</div>
                          <div className="text-xs text-muted-foreground">{getRoleName(currentUser.role)}</div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
