'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, AlertTriangle, MessageSquare, Paperclip, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatDistanceToNow, format } from 'date-fns';

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
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    createdAt: string;
    uploadedBy: {
      id: string;
      name: string;
    };
  }>;
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

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cases/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCaseData(data);
        } else {
          console.error('Failed to fetch case details');
        }
      } catch (error) {
        console.error('Error fetching case details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCaseDetails();
    }
  }, [params.id]);

  const getSLAStatus = () => {
    if (!caseData?.slaDueDate) {
      return { icon: Clock, color: 'text-gray-500', text: 'No SLA' };
    }

    const now = new Date();
    const dueDate = new Date(caseData.slaDueDate);

    if (caseData.slaBreached || now > dueDate) {
      return { 
        icon: AlertTriangle, 
        color: 'text-red-500', 
        text: 'SLA Breached' 
      };
    }

    const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 4) {
      return { 
        icon: Clock, 
        color: 'text-orange-500', 
        text: `Due in ${Math.floor(hoursLeft)} hours` 
      };
    }

    return { 
      icon: Clock, 
      color: 'text-green-500', 
      text: `Due ${formatDistanceToNow(dueDate)}` 
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Case not found</h2>
          <p className="text-muted-foreground mt-2">The case you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button className="mt-4" onClick={() => router.push('/cases')}>
            Back to Cases
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const slaStatus = getSLAStatus();
  const SLAIcon = slaStatus.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
            <h1 className="text-2xl font-bold">{caseData.title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.push(`/cases/${params.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Change Status</DropdownMenuItem>
                <DropdownMenuItem>Reassign Case</DropdownMenuItem>
                <DropdownMenuItem>Add to Knowledge Base</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={statusColors[caseData.status as keyof typeof statusColors]}>
            {caseData.status.replace(/_/g, ' ')}
          </Badge>
          <Badge className={priorityColors[caseData.priority as keyof typeof priorityColors]}>
            {caseData.priority}
          </Badge>
          {caseData.category && (
            <Badge variant="outline">{caseData.category.name}</Badge>
          )}
          {caseData.tags?.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="messages">
                  Messages {caseData.messages?.length > 0 && `(${caseData.messages.length})`}
                </TabsTrigger>
                <TabsTrigger value="documents">
                  Documents {caseData.documents?.length > 0 && `(${caseData.documents.length})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{caseData.description}</div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="messages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Communication history for this case</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {caseData.messages?.length > 0 ? (
                      <div className="space-y-4">
                        {caseData.messages.map((message) => (
                          <div key={message.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{message.sender.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(message.createdAt), 'PPpp')}
                                </p>
                              </div>
                              <Badge variant="outline">{message.sender.role}</Badge>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap">{message.content}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No messages yet</p>
                    )}
                    
                    <div className="mt-6">
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Files attached to this case</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {caseData.documents?.length > 0 ? (
                      <div className="space-y-2">
                        {caseData.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                            <div className="flex items-center">
                              <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded by {doc.uploadedBy.name} on {format(new Date(doc.createdAt), 'PP')}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No documents attached</p>
                    )}
                    
                    <div className="mt-6">
                      <Button className="w-full">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <p>{caseData.creator.name}</p>
                  <p className="text-xs text-muted-foreground">{caseData.creator.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p>{format(new Date(caseData.createdAt), 'PPP')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(caseData.createdAt))} ago
                  </p>
                </div>
                
                {caseData.assignee && (
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p>{caseData.assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{caseData.assignee.email}</p>
                  </div>
                )}
                
                {caseData.slaDueDate && (
                  <div>
                    <p className="text-sm font-medium">SLA Due Date</p>
                    <div className={`flex items-center ${slaStatus.color}`}>
                      <SLAIcon className="h-4 w-4 mr-1" />
                      <p>{slaStatus.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(caseData.slaDueDate), 'PPp')}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p>{formatDistanceToNow(new Date(caseData.updatedAt))} ago</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(caseData.updatedAt), 'PPp')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
