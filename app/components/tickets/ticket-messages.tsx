
'use client';

import { useState } from 'react';
import { Send, Paperclip, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
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
}

interface TicketMessagesProps {
  ticketId: string;
  messages: Message[];
  onMessageAdded: () => void;
}

export default function TicketMessages({ ticketId, messages, onMessageAdded }: TicketMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showInternal, setShowInternal] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          isInternal
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setIsInternal(false);
        onMessageAdded();
        toast.success('Message sent');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(message => 
    showInternal || !message.isInternal
  );

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

  return (
    <div className="space-y-6">
      {/* Message Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInternal(!showInternal)}
              >
                {showInternal ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Internal
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Internal
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* New Message Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={setIsInternal}
                    />
                    <Label htmlFor="internal" className="text-sm">
                      Internal note (not visible to customer)
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No messages yet</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`${message.isInternal ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {message.author ? getAuthorInitials(message.author.name) : 'SYS'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">
                        {message.author ? message.author.name : 'System'}
                      </span>
                      
                      {message.author && (
                        <Badge className={getRoleColor(message.author.role)}>
                          {message.author.role}
                        </Badge>
                      )}
                      
                      {message.isInternal && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Internal
                        </Badge>
                      )}
                      
                      {message.isSystem && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          System
                        </Badge>
                      )}
                      
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'PPP p')}
                      </span>
                    </div>
                    
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
