
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SLARuleFormProps {
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  description?: string;
  priority: string;
  responseTime: number;
  resolutionTime: number;
  categoryId?: string;
  isActive: boolean;
}

export default function SLARuleForm({ onSuccess }: SLARuleFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      isActive: true,
      priority: 'MEDIUM',
      responseTime: 60, // 1 hour in minutes
      resolutionTime: 480 // 8 hours in minutes
    }
  });

  const isActive = watch('isActive');
  const priority = watch('priority');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Set default times based on priority
    switch (priority) {
      case 'LOW':
        setValue('responseTime', 240); // 4 hours
        setValue('resolutionTime', 1440); // 24 hours
        break;
      case 'MEDIUM':
        setValue('responseTime', 120); // 2 hours
        setValue('resolutionTime', 480); // 8 hours
        break;
      case 'HIGH':
        setValue('responseTime', 60); // 1 hour
        setValue('resolutionTime', 240); // 4 hours
        break;
      case 'CRITICAL':
        setValue('responseTime', 30); // 30 minutes
        setValue('resolutionTime', 120); // 2 hours
        break;
      case 'URGENT':
        setValue('responseTime', 15); // 15 minutes
        setValue('resolutionTime', 60); // 1 hour
        break;
    }
  }, [priority, setValue]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tickets/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const response = await fetch('/api/sla/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('SLA rule created successfully');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create SLA rule');
      }
    } catch (error) {
      console.error('Error creating SLA rule:', error);
      toast.error('Failed to create SLA rule');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Rule name is required' })}
          placeholder="e.g., Critical Priority SLA"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Optional description of when this rule applies"
          rows={2}
        />
      </div>

      {/* Priority and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select onValueChange={(value) => setValue('priority', value)} defaultValue="MEDIUM">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select onValueChange={(value) => setValue('categoryId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Response and Resolution Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="responseTime">Response Time (minutes) *</Label>
          <Input
            id="responseTime"
            type="number"
            min="1"
            {...register('responseTime', { 
              required: 'Response time is required',
              min: { value: 1, message: 'Must be at least 1 minute' }
            })}
          />
          {errors.responseTime && (
            <p className="text-sm text-red-600">{errors.responseTime.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Time to first response: {formatTime(watch('responseTime') || 0)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolutionTime">Resolution Time (minutes) *</Label>
          <Input
            id="resolutionTime"
            type="number"
            min="1"
            {...register('resolutionTime', { 
              required: 'Resolution time is required',
              min: { value: 1, message: 'Must be at least 1 minute' }
            })}
          />
          {errors.resolutionTime && (
            <p className="text-sm text-red-600">{errors.resolutionTime.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Time to resolution: {formatTime(watch('resolutionTime') || 0)}
          </p>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive">
          Active rule (will be applied to new tickets)
        </Label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create SLA Rule'}
        </Button>
      </div>
    </form>
  );
}
