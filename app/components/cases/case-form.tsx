'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CaseFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    creator: {
      id: string;
      name: string;
    };
    assignments: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        name: string;
      };
    }>;
  };
}

export default function CaseForm({ initialData }: CaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch(`/api/cases/${initialData?.id || ''}`, {
        method: initialData ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          status: formData.get('status'),
          priority: formData.get('priority'),
          type: formData.get('type'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save case');
      }

      router.push('/cases');
      router.refresh();
    } catch (error) {
      console.error('Error saving case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={initialData?.title}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          defaultValue={initialData?.description}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          defaultValue={initialData?.status || 'OPEN'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          name="priority"
          id="priority"
          defaultValue={initialData?.priority || 'MEDIUM'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          name="type"
          id="type"
          defaultValue={initialData?.type}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="ACCOUNT_ACCESS">Account Access</option>
          <option value="BILLING_ISSUE">Billing Issue</option>
          <option value="TECHNICAL_SUPPORT">Technical Support</option>
          <option value="FEATURE_REQUEST">Feature Request</option>
          <option value="BUG_REPORT">Bug Report</option>
          <option value="DISPUTE_HANDLING">Dispute Handling</option>
          <option value="PRODUCT_COMPLIANCE">Product Compliance</option>
          <option value="RETURN_FRAUD">Return Fraud</option>
          <option value="INVENTORY_DISPUTE">Inventory Dispute</option>
          <option value="LOGISTICS_DELIVERY">Logistics & Delivery</option>
        </select>
      </div>

      {initialData && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Assignments</h3>
          <div className="space-y-2">
            {initialData.assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">{assignment.user.name}</p>
                  <p className="text-xs text-gray-500">{assignment.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Case' : 'Create Case'}
        </button>
      </div>
    </form>
  );
}
