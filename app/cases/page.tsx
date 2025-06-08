'use client';

import React, { useState, useEffect } from 'react';
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
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
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
  // Initialize state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Ensure we always have a valid array to work with
  const safeCases = Array.isArray(cases) ? cases : [];


  // Fetch cases when filters or page changes
  useEffect(() => {
    fetchCases();
  }, [currentPage, filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });

      const response = await fetch(`/api/cases/my-cases?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const data = await response.json();
      
      // Safely handle cases array
      setCases(Array.isArray(data?.cases) ? data.cases : []);
      
      // Safely handle pagination
      if (data?.pagination && typeof data.pagination.pages === 'number') {
        setTotalPages(data.pagination.pages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases([]);
      setTotalPages(1);
      setError(error instanceof Error ? error.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: CaseFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCaseCreated = () => {
    setShowCreateDialog(false);
    fetchCases();
  };

  const getSLAStatus = (caseItem: Case) => {
    if (!caseItem || !caseItem.slaDueDate) {
      return {
        icon: null,
        color: ''
      };
    }

    const now = new Date();
    const dueDate = new Date(caseItem.slaDueDate);
    const timeLeft = dueDate.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (caseItem.slaBreached) {
      return {
        icon: AlertTriangle,
        color: 'text-red-500'
      };
    } else if (hoursLeft < 4) {
      return {
        icon: Clock,
        color: 'text-amber-500'
      };
    }

    return {
      icon: Clock,
      color: 'text-green-500'
    };
  };

  // Error handling at component level
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500 p-4">{error}</div>
      </DashboardLayout>
    );
  }

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

            {(() => {
  try {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    // Empty state
    if (safeCases.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>No cases found.</p>
        </div>
      );
    }
                  return (
                  <div className="space-y-4">
                    {safeCases.map((caseItem) => {
                      const slaStatus = getSLAStatus(caseItem);
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
                                {caseItem._count && typeof caseItem._count.messages === 'number' && caseItem._count.messages > 0 && (
                                  <span>{caseItem._count.messages} messages</span>
                                )}
                                {caseItem._count && typeof caseItem._count.documents === 'number' && caseItem._count.documents > 0 && (
                                  <span>{caseItem._count.documents} attachments</span>
                                )}
                              </div>
                              
                              {caseItem.tags && Array.isArray(caseItem.tags) && caseItem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {caseItem.tags.map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="secondary"
                                      className="text-xs"
                                      style={{ backgroundColor: tag.color }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {caseItem.slaDueDate && slaStatus.icon && (
                                <div className={`flex items-center space-x-1 ${slaStatus.color}`}>
                                  {React.createElement(slaStatus.icon, { className: "h-4 w-4" })}
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
                );
              } catch (e) {
                console.error('CasesPage render error:', e);
                return <div className="text-red-500">An error occurred while rendering cases.</div>;
              }
            })()}
             
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
            {/* We'll need to create a CreateCaseForm component later */}
            <p className="text-center py-4">Case creation form will be implemented soon.</p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowCreateDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
