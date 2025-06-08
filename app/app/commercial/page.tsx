
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';

export default function CommercialDashboard() {
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
          
          // Get all cases (commercial team can see everything)
          const casesResponse = await fetch('/api/cases');
          if (casesResponse.ok) {
            const casesData = await casesResponse.json();
            setCases(casesData.cases || []);
          }

          // Get commercial metrics
          const metricsResponse = await fetch('/api/commercial/metrics');
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

  // Calculate metrics
  const totalCases = cases.length;
  const customerCases = cases.filter(c => c.creator?.role === 'CUSTOMER').length;
  const merchantCases = cases.filter(c => 
    ['DISPUTE_HANDLING', 'PRODUCT_COMPLIANCE', 'RETURN_FRAUD', 'INVENTORY_DISPUTE', 'LOGISTICS_DELIVERY'].includes(c.type)
  ).length;
  const escalatedCases = cases.filter(c => c.status === 'ESCALATED').length;
  const criticalCases = cases.filter(c => c.priority === 'CRITICAL').length;
  const slaViolations = cases.filter(c => {
    const daysSinceCreated = Math.floor((new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated > 7 && !['RESOLVED', 'CLOSED'].includes(c.status);
  }).length;

  const resolutionRate = totalCases > 0 ? Math.round((cases.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length / totalCases) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Strategic Command Center</h1>
          <p className="text-purple-100">
            Monitor performance, manage escalations, and ensure compliance across all operations.
          </p>
        </div>

        {/* Executive Metrics */}
        <div className="grid md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold">{totalCases}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Cases</p>
                  <p className="text-2xl font-bold">{customerCases}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Merchant Cases</p>
                  <p className="text-2xl font-bold">{merchantCases}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-red-600">{escalatedCases}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Violations</p>
                  <p className="text-2xl font-bold text-orange-600">{slaViolations}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-600">{resolutionRate}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Resolution Performance</CardTitle>
              <CardDescription>Overall system performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Resolution Rate</span>
                  <span>{resolutionRate}%</span>
                </div>
                <Progress value={resolutionRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Satisfaction</span>
                  <span>87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>SLA Compliance</span>
                  <span>{totalCases > 0 ? Math.round(((totalCases - slaViolations) / totalCases) * 100) : 100}%</span>
                </div>
                <Progress value={totalCases > 0 ? ((totalCases - slaViolations) / totalCases) * 100 : 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>First Response Time</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <CardDescription>Issues requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalCases > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Critical Cases</p>
                        <p className="text-sm text-red-700">{criticalCases} cases need urgent attention</p>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">
                      Review
                    </Button>
                  </div>
                )}
                
                {slaViolations > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-900">SLA Violations</p>
                        <p className="text-sm text-orange-700">{slaViolations} cases exceed SLA limits</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                )}
                
                {escalatedCases > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Escalated Cases</p>
                        <p className="text-sm text-yellow-700">{escalatedCases} cases escalated to management</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                )}
                
                {criticalCases === 0 && slaViolations === 0 && escalatedCases === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All systems green!</h3>
                    <p className="text-gray-600">No critical alerts at this time</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Case Management</CardTitle>
            <CardDescription>Multi-tier oversight and escalation management</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="escalations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="escalations">Escalations ({escalatedCases})</TabsTrigger>
                <TabsTrigger value="sla">SLA Monitoring ({slaViolations})</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="escalations" className="space-y-4">
                {escalatedCases === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No escalated cases</h3>
                    <p className="text-gray-600">Excellent! All cases are being handled at the appropriate level</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.filter(c => c.status === 'ESCALATED').map((case_) => (
                      <div
                        key={case_.id}
                        className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                        onClick={() => router.push(`/commercial/cases/${case_.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium text-red-900">{case_.title}</h4>
                            <Badge className="text-red-600 bg-red-100">
                              {case_.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-red-700 mb-2">{case_.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-red-600">
                            <span>Type: {case_.type.replace('_', ' ')}</span>
                            <span>Customer: {case_.creator?.name}</span>
                            <span>Escalated: {new Date(case_.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sla" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {totalCases > 0 ? Math.round(((totalCases - slaViolations) / totalCases) * 100) : 100}%
                        </p>
                        <p className="text-sm text-gray-600">SLA Compliance</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">4.2h</p>
                        <p className="text-sm text-gray-600">Avg Response Time</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">2.1d</p>
                        <p className="text-sm text-gray-600">Avg Resolution Time</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {slaViolations > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-orange-900">Cases Exceeding SLA</h4>
                    {cases.filter(c => {
                      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceCreated > 7 && !['RESOLVED', 'CLOSED'].includes(c.status);
                    }).map((case_) => (
                      <div
                        key={case_.id}
                        className="flex items-center justify-between p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <h4 className="font-medium text-orange-900">{case_.title}</h4>
                            <Badge className="text-orange-600 bg-orange-100">
                              {Math.floor((new Date().getTime() - new Date(case_.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days old
                            </Badge>
                          </div>
                          <p className="text-sm text-orange-700">{case_.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All SLAs met!</h3>
                    <p className="text-gray-600">No cases are currently exceeding SLA limits</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Team Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customer Support Team</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={92} className="w-20 h-2" />
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Merchant Relations</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={88} className="w-20 h-2" />
                          <span className="text-sm font-medium">88%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Technical Support</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={95} className="w-20 h-2" />
                          <span className="text-sm font-medium">95%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Case Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customer Issues</span>
                        <span className="text-sm font-medium">{customerCases} ({totalCases > 0 ? Math.round((customerCases / totalCases) * 100) : 0}%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Merchant Issues</span>
                        <span className="text-sm font-medium">{merchantCases} ({totalCases > 0 ? Math.round((merchantCases / totalCases) * 100) : 0}%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Internal Issues</span>
                        <span className="text-sm font-medium">{totalCases - customerCases - merchantCases} ({totalCases > 0 ? Math.round(((totalCases - customerCases - merchantCases) / totalCases) * 100) : 0}%)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
