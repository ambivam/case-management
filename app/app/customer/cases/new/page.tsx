
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CASE_TYPES = [
  { value: 'ORDER_ISSUE', label: 'Order Issue', description: 'Problems with orders, delivery, or fulfillment' },
  { value: 'PAYMENT_REFUND', label: 'Payment/Refund', description: 'Payment processing or refund requests' },
  { value: 'ACCOUNT_ACCESS', label: 'Account Access', description: 'Login issues or account problems' },
  { value: 'SERVICE_DISSATISFACTION', label: 'Service Dissatisfaction', description: 'Quality or service concerns' }
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', description: 'Non-urgent, can wait' },
  { value: 'MEDIUM', label: 'Medium', description: 'Standard priority' },
  { value: 'HIGH', label: 'High', description: 'Urgent, needs quick attention' },
  { value: 'CRITICAL', label: 'Critical', description: 'Emergency, immediate attention required' }
];

export default function NewCasePage() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title || !description || !type) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type,
          priority
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Case created successfully',
          description: 'Your support request has been submitted.',
        });
        router.push(`/customer/cases/${data.id}`);
      } else {
        setError(data.error || 'Failed to create case');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Case</h1>
            <p className="text-gray-600">Submit a support request and we'll help you resolve it</p>
          </div>
        </div>

        {/* Case Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Case Details</span>
            </CardTitle>
            <CardDescription>
              Provide detailed information about your issue to help us assist you better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Case Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Case Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Issue Type *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((caseType) => (
                      <SelectItem key={caseType.value} value={caseType.value}>
                        <div>
                          <div className="font-medium">{caseType.label}</div>
                          <div className="text-sm text-gray-500">{caseType.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priorityOption) => (
                      <SelectItem key={priorityOption.value} value={priorityOption.value}>
                        <div>
                          <div className="font-medium">{priorityOption.label}</div>
                          <div className="text-sm text-gray-500">{priorityOption.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide a detailed description of your issue, including any relevant information that might help us resolve it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500">
                  Include steps to reproduce the issue, error messages, and any other relevant details
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Case
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Before creating a case:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check our FAQ section for common solutions</li>
                  <li>• Search existing cases to see if your issue has been addressed</li>
                  <li>• Gather any relevant information (order numbers, error messages, etc.)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">What happens next:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive a confirmation email with your case number</li>
                  <li>• Our support team will review your case within 24 hours</li>
                  <li>• You'll be notified of any updates via email and in your dashboard</li>
                  <li>• You can add additional information or documents at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
