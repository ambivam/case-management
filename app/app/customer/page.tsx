
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Upload,
  HelpCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Get user's cases
        const casesResponse = await fetch('/api/cases/my-cases');
        if (!casesResponse.ok) {
          throw new Error('Failed to fetch cases');
        }

        const casesData = await casesResponse.json();
        if (!Array.isArray(casesData?.cases)) {
          throw new Error('Invalid cases data format');
        }

        setCases(casesData.cases);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      case 'PENDING_CUSTOMER':
        return 'bg-orange-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 20;
      case 'IN_PROGRESS':
        return 50;
      case 'PENDING_CUSTOMER':
        return 70;
      case 'RESOLVED':
        return 90;
      case 'CLOSED':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-red-500">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user || undefined}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100">
            Manage your cases and get support when you need it.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => router.push('/customer/cases/new')}>
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Create Case</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Submit a new support request</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => router.push('/customer/cases')}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">My Cases</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View all your cases</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => console.log('Messages feature coming soon')}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Messages</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chat with support</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => console.log('Help Center feature coming soon')}>
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Help Center</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse FAQ and guides</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
                  <p className="text-2xl font-bold">{cases.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Cases</p>
                  <p className="text-2xl font-bold">
                    {cases.filter((c) => ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER'].includes(c.status)).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold">
                    {cases.filter((c) => c.status === 'RESOLVED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                  <p className="text-2xl font-bold">
                    {cases.filter((c) => ['HIGH', 'CRITICAL'].includes(c.priority)).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Your latest support requests</CardDescription>
              </div>
              <Button onClick={() => router.push('/customer/cases')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No cases yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first case to get started</p>
                <Button onClick={() => router.push('/customer/cases/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Case
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.slice(0, 5).map((case_) => (
                  <div
                    key={case_.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => router.push(`/customer/cases/${case_.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{case_.title}</h4>
                        <Badge className={getPriorityColor(case_.priority)}>
                          {case_.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{case_.description}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(case_.status)}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{case_.status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {new Date(case_.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={getStatusProgress(case_.status)} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
