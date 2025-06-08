
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, TrendingUp, FileText, MessageSquare, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Redirect to appropriate dashboard based on role
          switch (userData.role) {
            case 'CUSTOMER':
              router.push('/customer');
              break;
            case 'MERCHANT':
              router.push('/merchant');
              break;
            case 'COMMERCIAL':
              router.push('/commercial');
              break;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to appropriate dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CaseFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button className="cursor-pointer" onClick={() => router.push('/get-started')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Streamline Your Case Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Comprehensive case management system designed for SaaS businesses with role-based access for customers, merchants, and commercial teams.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="cursor-pointer" onClick={() => router.push('/get-started')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="cursor-pointer" onClick={() => router.push('/learn-more')}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Built for Every Role
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Features */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => router.push('/register')}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <CardTitle>Customer Portal</CardTitle>
                </div>
                <CardDescription>
                  Self-service case management for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Create and track cases</li>
                  <li>• Real-time status updates</li>
                  <li>• Document uploads</li>
                  <li>• Direct messaging with support</li>
                  <li>• FAQ and help center</li>
                </ul>
                <Badge variant="secondary" className="mt-4">
                  Customer Role
                </Badge>
              </CardContent>
            </Card>

            {/* Merchant Features */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => router.push('/register')}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-green-600" />
                  <CardTitle>Merchant Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Advanced case handling for merchants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Bulk case management</li>
                  <li>• Dispute resolution tools</li>
                  <li>• Performance metrics</li>
                  <li>• Evidence submission</li>
                  <li>• Escalation workflows</li>
                </ul>
                <Badge variant="secondary" className="mt-4">
                  Merchant Role
                </Badge>
              </CardContent>
            </Card>

            {/* Commercial Features */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => router.push('/register')}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <CardTitle>Commercial Oversight</CardTitle>
                </div>
                <CardDescription>
                  Strategic case management and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Multi-tier case oversight</li>
                  <li>• SLA monitoring</li>
                  <li>• Strategic escalations</li>
                  <li>• Performance dashboards</li>
                  <li>• Compliance tracking</li>
                </ul>
                <Badge variant="secondary" className="mt-4">
                  Commercial Role
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Case Types</h4>
              <p className="text-gray-600 dark:text-gray-300">Support for 12+ case categories</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Real-time</h4>
              <p className="text-gray-600 dark:text-gray-300">Instant messaging and updates</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Secure</h4>
              <p className="text-gray-600 dark:text-gray-300">Role-based access control</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">CaseFlow</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500">
            © 2025 CaseFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
