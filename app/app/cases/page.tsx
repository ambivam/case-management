'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatDistanceToNow } from 'date-fns';
import CreateCaseForm from '@/components/cases/create-case-form';

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  slaDueDate?: string;
  slaBreached: boolean;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };

  _count: {
    messages: number;
    documents: number;
  };
}

interface CaseFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  assigneeId?: string;
  search?: string;
}

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PENDING_CUSTOMER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  PENDING_MERCHANT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  WAITING_FOR_APPROVAL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  ESCALATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });

      const response = await fetch(`/api/cases/my-cases?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the fetchCases function to prevent infinite re-renders
  const fetchCasesRef = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });

      const response = await fetch(`/api/cases/my-cases?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Error fetching cases:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchCasesRef();
  }, [fetchCasesRef]);

  const handleFilterChange = (newFilters: CaseFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCaseCreated = () => {
    setShowCreateDialog(false);
    fetchCases();
  };

  const getSLAStatus = (caseItem: Case) => {
    if (!caseItem.slaDueDate) {
      return { icon: Clock, color: 'text-gray-500' };
    }

    const now = new Date();
    const dueDate = new Date(caseItem.slaDueDate);

    if (caseItem.slaBreached || now > dueDate) {
      return { icon: AlertTriangle, color: 'text-red-500' };
    }

    const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 4) {
      return { icon: Clock, color: 'text-orange-500' };
    }

    return { icon: Clock, color: 'text-green-500' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cases</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Case
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Cases</CardTitle>
            <CardDescription>
              View and manage all your cases
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cases..."
                  className="pl-8"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="PENDING_CUSTOMER">Pending Customer</SelectItem>
                    <SelectItem value="PENDING_MERCHANT">Pending Merchant</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) => handleFilterChange({ ...filters, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => handleFilterChange({})}
                  className="md:col-start-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No cases found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => {
                  const slaStatus = getSLAStatus(caseItem);
                  const SLAIcon = slaStatus.icon;
                  
                  return (
                    <div
                      key={caseItem.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/cases/${caseItem.id}`}
                    >
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{caseItem.title}</h3>
                            <Badge className={statusColors[caseItem.status as keyof typeof statusColors]}>
                              {caseItem.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={priorityColors[caseItem.priority as keyof typeof priorityColors]}>
                              {caseItem.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {caseItem.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span>Created {formatDistanceToNow(new Date(caseItem.createdAt))} ago</span>
                            {caseItem.assignee && (
                              <span>Assigned to {caseItem.assignee.name}</span>
                            )}
                            {caseItem.category && (
                              <span>Category: {caseItem.category.name}</span>
                            )}
                            {caseItem._count.messages > 0 && (
                              <span>{caseItem._count.messages} messages</span>
                            )}
                            {caseItem._count.documents > 0 && (
                              <span>{caseItem._count.documents} attachments</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {caseItem.slaDueDate && (
                            <div className={`flex items-center space-x-1 ${slaStatus.color}`}>
                              <SLAIcon className="h-4 w-4" />
                              <span className="text-xs">
                                {caseItem.slaBreached 
                                  ? 'SLA Breached' 
                                  : `Due ${formatDistanceToNow(new Date(caseItem.slaDueDate))}`
                                }
                              </span>
                            </div>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/cases/${caseItem.id}`;
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/cases/${caseItem.id}/edit`;
                                }}
                              >
                                Edit Case
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Case Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new case.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CreateCaseForm
              onSuccess={handleCaseCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
