'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Paperclip,
  Send,
  Upload,
  File
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/dashboard-layout';

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
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  documents: Array<Document>;
}

interface Document {
  id: string;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
    role: string;
  };
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

export default function CustomerCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim() || !params.id) return;
    
    setUploadingDocument(true);
    try {
      const response = await fetch(`/api/cases/${params.id}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: documentName,
          fileType: 'application/pdf' // In a real app, this would be determined from the actual file
        }),
      });

      if (response.ok) {
        const newDocument = await response.json();
        setDocumentName('');
        setIsUploadDialogOpen(false);
        toast({
          title: 'Document uploaded',
          description: 'Your document has been added to the case.',
        });
        
        // Update the case data with the new document
        if (caseData) {
          const updatedDocuments = [newDocument, ...(caseData.documents || [])];
          setCaseData({
            ...caseData,
            documents: updatedDocuments,
            _count: {
              ...caseData._count,
              documents: (caseData._count?.documents || 0) + 1
            }
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Failed to upload document',
          description: errorData.error || 'An error occurred while uploading your document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while uploading your document',
        variant: 'destructive',
      });
    } finally {
      setUploadingDocument(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !params.id) return;
    
    setSendingMessage(true);
    try {
      const response = await fetch(`/api/cases/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessageContent('');
        toast({
          title: 'Message sent',
          description: 'Your message has been added to the case.',
        });
        
        // Update the case data with the new message
        if (caseData) {
          const updatedMessages = [newMessage, ...(caseData.messages || [])];
          setCaseData({
            ...caseData,
            messages: updatedMessages,
            _count: {
              ...caseData._count,
              messages: (caseData._count?.messages || 0) + 1
            }
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Failed to send message',
          description: errorData.error || 'An error occurred while sending your message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while sending your message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cases/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setCaseData(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Failed to fetch case details');
        }
      } catch (error) {
        console.error('Error fetching case details:', error);
        setError('An error occurred while fetching case details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCaseData();
    }
  }, [params.id]);

  const getSLAStatus = () => {
    if (!caseData || !caseData.slaDueDate) {
      return { text: 'No SLA', color: 'text-gray-500', icon: Clock };
    }

    const now = new Date();
    const dueDate = new Date(caseData.slaDueDate);
    const timeLeft = dueDate.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (caseData.slaBreached || timeLeft < 0) {
      return { text: 'SLA Breached', color: 'text-red-500', icon: AlertTriangle };
    } else if (hoursLeft < 24) {
      return { text: `Due in ${formatDistanceToNow(dueDate)}`, color: 'text-orange-500', icon: Clock };
    } else {
      return { text: `Due in ${formatDistanceToNow(dueDate)}`, color: 'text-green-500', icon: CheckCircle2 };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !caseData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error || 'Case not found'}</p>
          <Button onClick={() => router.push('/customer/cases')}>Back to Cases</Button>
        </div>
      </DashboardLayout>
    );
  }

  const slaStatus = getSLAStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{caseData.title}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className={statusColors[caseData.status as keyof typeof statusColors]}>
                {caseData.status.replace(/_/g, ' ')}
              </Badge>
              <Badge className={priorityColors[caseData.priority as keyof typeof priorityColors]}>
                {caseData.priority}
              </Badge>
              {caseData.category && (
                <Badge variant="outline">{caseData.category.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(caseData.createdAt))} ago
              </span>
              {caseData.slaDueDate && (
                <div className={`flex items-center ${slaStatus.color}`}>
                  {React.createElement(slaStatus.icon, { className: "h-4 w-4 mr-1" })}
                  <p>{slaStatus.text}</p>
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => router.push('/customer/cases')}>Back to Cases</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages">
              Messages {caseData._count && typeof caseData._count.messages === 'number' && caseData._count.messages > 0 && `(${caseData._count.messages})`}
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents {caseData._count && typeof caseData._count.documents === 'number' && caseData._count.documents > 0 && `(${caseData._count.documents})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Creator</h3>
                    <p>{caseData.creator.name}</p>
                    <p className="text-sm text-muted-foreground">{caseData.creator.email}</p>
                  </div>

                  {caseData.assignee && (
                    <div>
                      <h3 className="font-medium mb-2">Assigned To</h3>
                      <p>{caseData.assignee.name}</p>
                      <p className="text-sm text-muted-foreground">{caseData.assignee.email}</p>
                    </div>
                  )}
                </div>

                {caseData.tags && Array.isArray(caseData.tags) && caseData.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {caseData.tags?.map(tag => (
                        <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messages
                </CardTitle>
                <CardDescription>
                  Communication history for this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {caseData.messages && Array.isArray(caseData.messages) && caseData.messages.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.messages.map(message => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{message.user?.name || message.user?.name || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt))} ago
                            </p>
                          </div>
                          <Badge variant="outline">{message.user?.role || message.user?.role || "Unknown"}</Badge>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                )}

                <form onSubmit={handleAddMessage} className="mt-6 space-y-4">
                  <Textarea 
                    placeholder="Type your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[100px]"
                    disabled={sendingMessage}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={sendingMessage || !messageContent.trim()}
                  >
                    {sendingMessage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Add Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Files and attachments related to this case</CardDescription>
              </CardHeader>
              <CardContent>
                {caseData.documents && caseData.documents.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {formatDistanceToNow(new Date(doc.createdAt))} ago
                              {doc.uploader && ` by ${doc.uploader.name}`}
                              <span className="ml-2 text-xs">{(doc.filesize / 1024).toFixed(1)} KB</span>
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.filepath} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Paperclip className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">No documents attached</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload documents related to this case
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUploadDocument} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="file">Select File</Label>
                          <Input 
                            id="file" 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentName">Document Name</Label>
                          <Input 
                            id="documentName" 
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Enter document name"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsUploadDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={uploadingDocument || !documentName.trim()}
                          >
                            {uploadingDocument ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>Upload</>  
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
