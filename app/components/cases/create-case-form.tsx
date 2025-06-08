'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

// These must match exactly with the API's valid case types
const CASE_TYPES = [
  'ACCOUNT_ACCESS',
  'BILLING_ISSUE',
  'TECHNICAL_SUPPORT',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'DISPUTE_HANDLING',
  'PRODUCT_COMPLIANCE',
  'RETURN_FRAUD',
  'INVENTORY_DISPUTE',
  'LOGISTICS_DELIVERY'
] as const;

const PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
  'URGENT'
] as const;

interface CreateCaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCaseForm({ onSuccess, onCancel }: CreateCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<typeof CASE_TYPES[number]>('TECHNICAL_SUPPORT');
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('MEDIUM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log the data being sent
      console.log('Submitting case with data:', {
        title,
        description,
        type,
        priority
      });

      const requestData = {
        title,
        description,
        type,
        priority,
      };

      console.log('Sending request with data:', requestData);

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type,
          priority,
        }),
      });

      const data = await response.json();
      console.log('Response from server:', { status: response.status, data });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Case created successfully',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create case',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while creating the case',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Case Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter case title"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Issue Type
        </label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as typeof CASE_TYPES[number])}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select issue type" />
          </SelectTrigger>
          <SelectContent>
            {CASE_TYPES.map((caseType) => (
              <SelectItem key={caseType} value={caseType}>
                {caseType.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as typeof PRIORITIES[number])}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe your issue"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Case'}
        </Button>
      </div>
    </form>
  );
}
