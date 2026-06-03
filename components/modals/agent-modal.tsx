'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAgent, updateAgent } from '@/lib/api';

interface Agent {
  id?: number;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  agent_code: string;
  agent_type: string;
  status: string;
  license_number: string;
  license_expiry: string;
  commission_rate: number;
  specialization?: string;
  bank_account?: string;
  bank_name?: string;
  bank_code?: string;
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent?: Agent;
}

export function AgentModal({ isOpen, onClose, onSuccess, agent }: AgentModalProps) {
  const [formData, setFormData] = useState<Partial<Agent>>({
    agent_type: 'direct',
    status: 'active',
    commission_rate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agent) {
      setFormData(agent);
    } else {
      setFormData({
        agent_type: 'direct',
        status: 'active',
        commission_rate: 0,
      });
    }
  }, [agent, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'commission_rate' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (agent?.id) {
        await updateAgent(agent.id, formData);
      } else {
        await createAgent(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save agent');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold">
              {agent ? 'Edit Agent' : 'Add New Agent'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  name="first_name"
                  value={formData.user?.first_name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      user: { ...prev.user, first_name: e.target.value } as any,
                    }))
                  }
                  placeholder="Enter first name"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  name="last_name"
                  value={formData.user?.last_name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      user: { ...prev.user, last_name: e.target.value } as any,
                    }))
                  }
                  placeholder="Enter last name"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.user?.email || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      user: { ...prev.user, email: e.target.value } as any,
                    }))
                  }
                  placeholder="Enter email"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  name="username"
                  value={formData.user?.username || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      user: { ...prev.user, username: e.target.value } as any,
                    }))
                  }
                  placeholder="Enter username"
                  disabled={isLoading || !!agent}
                  required
                />
              </div>

              {/* Agent Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent Code</label>
                <Input
                  name="agent_code"
                  value={formData.agent_code || ''}
                  onChange={handleChange}
                  placeholder="e.g., AG-001"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Agent Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent Type</label>
                <select
                  name="agent_type"
                  value={formData.agent_type || 'direct'}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="direct">Direct</option>
                  <option value="broker">Broker</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium mb-2">License Number</label>
                <Input
                  name="license_number"
                  value={formData.license_number || ''}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  disabled={isLoading}
                />
              </div>

              {/* License Expiry */}
              <div>
                <label className="block text-sm font-medium mb-2">License Expiry</label>
                <Input
                  name="license_expiry"
                  type="date"
                  value={formData.license_expiry || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Commission Rate */}
              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <Input
                  name="commission_rate"
                  type="number"
                  step="0.01"
                  value={formData.commission_rate || 0}
                  onChange={handleChange}
                  placeholder="e.g., 5.5"
                  disabled={isLoading}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <Input
                  name="bank_name"
                  value={formData.bank_name || ''}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                  disabled={isLoading}
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium mb-2">Bank Account</label>
                <Input
                  name="bank_account"
                  value={formData.bank_account || ''}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  disabled={isLoading}
                />
              </div>

              {/* Bank Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Bank Code</label>
                <Input
                  name="bank_code"
                  value={formData.bank_code || ''}
                  onChange={handleChange}
                  placeholder="Enter bank code"
                  disabled={isLoading}
                />
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium mb-2">Specialization</label>
                <Input
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleChange}
                  placeholder="e.g., Motor Insurance"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {isLoading ? 'Saving...' : agent ? 'Update Agent' : 'Add Agent'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
