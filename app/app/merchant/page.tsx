
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function MerchantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          // Get cases
          const casesResponse = await fetch('/api/cases');
          if (casesResponse.ok) {
            const casesData = await casesResponse.json();
            setCases(casesData.cases || []);
          }

          // Get metrics
          const metricsResponse = await fetch('/api/merchant/metrics');
          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json();
            setMetrics(metricsData);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS':
        return 'text-yellow-600 bg-yellow-50';
      case 'PENDING_MERCHANT':
        return 'text-orange-600 bg-orange-50';
      case 'ESCALATED':
        return 'text-red-600 bg-red-50';
      case 'RESOLVED':
        return 'text-green-600 bg-green-50';
      case 'CLOSED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const merchantCases = cases.filter(c => 
    ['DISPUTE_HANDLING', 'PRODUCT_COMPLIANCE', 'RETURN_FRAUD', 'INVENTORY_DISPUTE', 'LOGISTICS_DELIVERY'].includes(c.type)
  );

  const pendingCases = merchantCases.filter(c => c.status === 'PENDING_MERCHANT');
  const escalatedCases = merchantCases.filter(c => c.status === 'ESCALATED');
  const highPriorityCases = merchantCases.filter(c => ['HIGH', 'CRITICAL'].includes(c.priority));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Merchant Control Center</h1>
          <p className="text-green-100">
            Manage customer disputes, compliance issues, and operational cases efficiently.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold">{merchantCases.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Action</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCases.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-red-600">{escalatedCases.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-purple-600">{highPriorityCases.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Bulk Case Handling</h3>
              <p className="text-sm text-gray-600">Process multiple cases at once</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Performance Metrics</h3>
              <p className="text-sm text-gray-600">View resolution statistics</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold">Escalation Queue</h3>
              <p className="text-sm text-gray-600">Handle escalated cases</p>
            </CardContent>
          </Card>
        </div>

        {/* Case Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Case Management</CardTitle>
            <CardDescription>Monitor and manage customer cases by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">Pending Action ({pendingCases.length})</TabsTrigger>
                <TabsTrigger value="escalated">Escalated ({escalatedCases.length})</TabsTrigger>
                <TabsTrigger value="all">All Cases ({merchantCases.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                {pendingCases.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No cases pending your action</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCases.map((case_) => (
                      <div
                        key={case_.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/merchant/cases/${case_.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{case_.title}</h4>
                            <Badge className={getPriorityColor(case_.priority)}>
                              {case_.priority}
                            </Badge>
                            <Badge className={getStatusColor(case_.status)}>
                              {case_.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{case_.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Type: {case_.type.replace('_', ' ')}</span>
                            <span>Created: {new Date(case_.createdAt).toLocaleDateString()}</span>
                            <span>Messages: {case_._count?.messages || 0}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="escalated" className="space-y-4">
                {escalatedCases.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No escalated cases</h3>
                    <p className="text-gray-600">Great job keeping things under control!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {escalatedCases.map((case_) => (
                      <div
                        key={case_.id}
                        className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                        onClick={() => router.push(`/merchant/cases/${case_.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium text-red-900">{case_.title}</h4>
                            <Badge className={getPriorityColor(case_.priority)}>
                              {case_.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-red-700 mb-2">{case_.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-red-600">
                            <span>Type: {case_.type.replace('_', ' ')}</span>
                            <span>Escalated: {new Date(case_.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">All Merchant Cases</h3>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="space-y-4">
                  {merchantCases.slice(0, 10).map((case_) => (
                    <div
                      key={case_.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/merchant/cases/${case_.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{case_.title}</h4>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{case_.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {case_.type.replace('_', ' ')}</span>
                          <span>Created: {new Date(case_.createdAt).toLocaleDateString()}</span>
                          <span>Customer: {case_.creator?.name}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
