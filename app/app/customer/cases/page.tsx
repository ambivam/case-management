
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

export default function CustomerCasesPage() {
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [filteredCases, setFilteredCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          // Get user's cases
          const casesResponse = await fetch('/api/cases/my-cases');
          if (casesResponse.ok) {
            const casesData = await casesResponse.json();
            setCases(casesData);
            setFilteredCases(casesData);
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

  useEffect(() => {
    let filtered = cases;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS':
        return 'text-yellow-600 bg-yellow-50';
      case 'PENDING_CUSTOMER':
        return 'text-orange-600 bg-orange-50';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <FileText className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'PENDING_CUSTOMER':
        return <AlertCircle className="h-4 w-4" />;
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Cases</h1>
            <p className="text-gray-600">Track and manage your support requests</p>
          </div>
          <Button onClick={() => router.push('/customer/cases/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PENDING_CUSTOMER">Pending Customer</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {cases.length === 0 ? 'No cases yet' : 'No cases match your filters'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {cases.length === 0 
                    ? 'Create your first case to get started with support'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {cases.length === 0 && (
                  <Button onClick={() => router.push('/customer/cases/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Case
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((case_) => (
              <Card
                key={case_.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/customer/cases/${case_.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(case_.status)}`}>
                          {getStatusIcon(case_.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{case_.title}</h3>
                          <p className="text-sm text-gray-500">Case #{case_.id.slice(-8)}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{case_.description}</p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(case_.priority)}>
                          {case_.priority}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(case_.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{getStatusProgress(case_.status)}%</span>
                        </div>
                        <Progress value={getStatusProgress(case_.status)} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Type: {case_.type.replace('_', ' ')}</span>
                          <span>Messages: {case_._count?.messages || 0}</span>
                          {case_._count?.documents > 0 && (
                            <span>Documents: {case_._count.documents}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">View Details</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {cases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
              <CardDescription>Overview of your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
                  <p className="text-sm text-gray-600">Total Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {cases.filter(c => ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER'].includes(c.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">Active Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {cases.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">Resolved Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {cases.length > 0 ? Math.round((cases.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length / cases.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
