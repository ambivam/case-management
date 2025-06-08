
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, AlertTriangle, MessageSquare, Paperclip, Activity, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/layout/dashboard-layout';
import TicketMessages from '@/components/tickets/ticket-messages';
import TicketActivity from '@/components/tickets/ticket-activity';
import TicketEditForm from '@/components/tickets/ticket-edit-form';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
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
  template?: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  messages: Array<{
    id: string;
    content: string;
    isInternal: boolean;
    isSystem: boolean;
    createdAt: string;
    author?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  documents: Array<{
    id: string;
    filename: string;
    filesize: number;
    mimetype: string;
    createdAt: string;
    uploader: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  activities: Array<{
    id: string;
    action: string;
    description: string;
    metadata?: any;
    createdAt: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
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

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else {
        toast.error('Failed to load ticket');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    // Refresh ticket data from server to get all relations
    await fetchTicket();
    setIsEditing(false);
  };

  const getSLAStatus = (ticket: Ticket) => {
    if (ticket.slaBreached) {
      return { 
        status: 'breached', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 dark:bg-red-900',
        icon: AlertTriangle,
        text: 'SLA Breached'
      };
    }
    
    if (ticket.slaDueDate) {
      const dueDate = new Date(ticket.slaDueDate);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue <= 2 && hoursUntilDue > 0) {
        return { 
          status: 'at-risk', 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-100 dark:bg-orange-900',
          icon: Clock,
          text: `Due in ${Math.round(hoursUntilDue)}h`
        };
      } else if (hoursUntilDue > 0) {
        return { 
          status: 'on-track', 
          color: 'text-green-600', 
          bgColor: 'bg-green-100 dark:bg-green-900',
          icon: Clock,
          text: `Due ${formatDistanceToNow(dueDate)}`
        };
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ticket not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const slaStatus = getSLAStatus(ticket);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <p className="text-muted-foreground">
                Ticket #{ticket.id.slice(-8)} • Created {formatDistanceToNow(new Date(ticket.createdAt))} ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit Ticket
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Share Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Ticket Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {ticket.priority}
                      </Badge>
                      {ticket.category && (
                        <Badge variant="outline" style={{ backgroundColor: ticket.category.color }}>
                          {ticket.category.name}
                        </Badge>
                      )}
                    </div>
                    
                    {slaStatus && (
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-md ${slaStatus.bgColor}`}>
                        <slaStatus.icon className={`h-4 w-4 ${slaStatus.color}`} />
                        <span className={`text-sm font-medium ${slaStatus.color}`}>
                          {slaStatus.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                  
                  {ticket.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {ticket.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.creator.name} ({ticket.creator.role})
                  </p>
                  <p className="text-xs text-muted-foreground">{ticket.creator.email}</p>
                </div>
                
                {ticket.assignee && (
                  <div>
                    <p className="text-sm font-medium">Assigned to</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignee.name} ({ticket.assignee.role})
                    </p>
                    <p className="text-xs text-muted-foreground">{ticket.assignee.email}</p>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.createdAt), 'PPP p')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.updatedAt), 'PPP p')}
                  </p>
                </div>
                
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium">Resolved</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.resolvedAt), 'PPP p')}
                    </p>
                  </div>
                )}
                
                {ticket.slaDueDate && (
                  <div>
                    <p className="text-sm font-medium">SLA Due</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.slaDueDate), 'PPP p')}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-sm text-muted-foreground">{ticket.source}</p>
                </div>
                
                {ticket.template && (
                  <div>
                    <p className="text-sm font-medium">Template</p>
                    <p className="text-sm text-muted-foreground">{ticket.template.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.messages.length} messages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.documents.length} attachments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.activities.length} activities</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for Messages and Activity */}
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">
              Messages ({ticket.messages.length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity ({ticket.activities.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            <TicketMessages 
              ticketId={ticket.id} 
              messages={ticket.messages}
              onMessageAdded={fetchTicket}
            />
          </TabsContent>
          
          <TabsContent value="activity">
            <TicketActivity activities={ticket.activities} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {isEditing && (
          <TicketEditForm
            ticket={ticket}
            onSuccess={handleTicketUpdate}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
