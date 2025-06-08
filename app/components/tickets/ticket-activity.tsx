
'use client';

import { Activity, User, Tag, AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ActivityItem {
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
}

interface TicketActivityProps {
  activities: ActivityItem[];
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'CREATED':
      return { icon: CheckCircle, color: 'text-green-600' };
    case 'STATUS_CHANGED':
      return { icon: Activity, color: 'text-blue-600' };
    case 'PRIORITY_CHANGED':
      return { icon: AlertTriangle, color: 'text-orange-600' };
    case 'ASSIGNED':
      return { icon: User, color: 'text-purple-600' };
    case 'MESSAGE_ADDED':
      return { icon: MessageSquare, color: 'text-gray-600' };
    case 'TAG_ADDED':
    case 'TAG_REMOVED':
      return { icon: Tag, color: 'text-indigo-600' };
    default:
      return { icon: Activity, color: 'text-gray-600' };
  }
};

const getAuthorInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'CUSTOMER':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'MERCHANT':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'COMMERCIAL':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function TicketActivity({ activities }: TicketActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const { icon: Icon, color } = getActivityIcon(activity.action);
        const isLast = index === activities.length - 1;
        
        return (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-px bg-border"></div>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-4">
                  {/* Activity Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {activity.description}
                      </span>
                      
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.createdAt), 'PPP p')}
                      </span>
                    </div>
                    
                    {activity.user && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getAuthorInitials(activity.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <span className="text-sm text-muted-foreground">
                          {activity.user.name}
                        </span>
                        
                        <Badge className={getRoleColor(activity.user.role)}>
                          {activity.user.role}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Metadata display */}
                    {activity.metadata && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
