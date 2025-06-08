
'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, TrendingUp, Target, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SLARuleForm from '@/components/sla/sla-rule-form';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
});

const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
});

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SLAMetrics {
  overview: {
    totalTickets: number;
    resolvedTickets: number;
    breachedTickets: number;
    atRiskTickets: number;
    slaCompliance: number;
    resolutionRate: number;
    avgResolutionTime: number;
  };
  priorityBreakdown: Array<{
    priority: string;
    _count: number;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    _count: number;
  }>;
}

interface SLARule {
  id: string;
  name: string;
  description?: string;
  priority: string;
  responseTime: number;
  resolutionTime: number;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function SLAPage() {
  const [metrics, setMetrics] = useState<SLAMetrics | null>(null);
  const [rules, setRules] = useState<SLARule[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchMetrics();
    fetchRules();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sla/metrics?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching SLA metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/sla/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching SLA rules:', error);
    }
  };

  const handleRuleCreated = () => {
    setShowCreateDialog(false);
    fetchRules();
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-600';
    if (compliance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceProgress = (compliance: number) => {
    if (compliance >= 95) return 'bg-green-500';
    if (compliance >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Chart data
  const priorityChartData = {
    labels: metrics?.priorityBreakdown.map(p => p.priority) || [],
    datasets: [
      {
        label: 'Tickets by Priority',
        data: metrics?.priorityBreakdown.map(p => p._count) || [],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)', // LOW - gray
          'rgba(59, 130, 246, 0.8)',  // MEDIUM - blue
          'rgba(249, 115, 22, 0.8)',  // HIGH - orange
          'rgba(239, 68, 68, 0.8)',   // CRITICAL - red
          'rgba(220, 38, 38, 0.8)',   // URGENT - dark red
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const complianceTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'SLA Compliance %',
        data: [92, 88, 95, metrics?.overview.slaCompliance || 0],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SLA Management</h1>
            <p className="text-muted-foreground">
              Monitor service level agreements and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New SLA Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create SLA Rule</DialogTitle>
                  <DialogDescription>
                    Define service level agreement rules for different ticket types and priorities.
                  </DialogDescription>
                </DialogHeader>
                <SLARuleForm onSuccess={handleRuleCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">SLA Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            {loading ? (
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getComplianceColor(metrics?.overview.slaCompliance || 0)}`}>
                      {metrics?.overview.slaCompliance.toFixed(1)}%
                    </div>
                    <Progress 
                      value={metrics?.overview.slaCompliance || 0} 
                      className="mt-2"
                      // @ts-ignore
                      indicatorClassName={getComplianceProgress(metrics?.overview.slaCompliance || 0)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">At Risk Tickets</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics?.overview.atRiskTickets || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SLA due within 2 hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.overview.avgResolutionTime.toFixed(1)}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average time to resolve
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics?.overview.resolutionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tickets resolved
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tickets by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar data={priorityChartData} options={chartOptions} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SLA Compliance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <Line data={complianceTrendData} options={chartOptions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid gap-4">
              {rules.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No SLA rules configured</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Create your first SLA rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                rules.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          {rule.description && (
                            <CardDescription>{rule.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {rule.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium">Response Time</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.floor(rule.responseTime / 60)}h {rule.responseTime % 60}m
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Resolution Time</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.floor(rule.resolutionTime / 60)}h {rule.resolutionTime % 60}m
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.category?.name || 'All categories'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  In-depth analysis of SLA performance and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Advanced analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
