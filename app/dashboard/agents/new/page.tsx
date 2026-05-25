'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAgent } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function NewAgentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    user: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
    },
    agent_type: 'individual',
    license_number: '',
    license_expiry: '',
    commission_rate: 15.0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    section?: string
  ) => {
    const { name, value } = e.target;

    if (section === 'user') {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'commission_rate' ? parseFloat(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[v0] Creating new agent:', formData);
      await createAgent(formData);
      router.push('/dashboard/agents');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create agent. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/agents" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Back to Agents
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Create New Agent
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new insurance agent or broker to the system
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div>
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              User Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.user.first_name}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.user.last_name}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.user.email}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="john@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.user.phone}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username *</label>
                <Input
                  type="text"
                  name="username"
                  value={formData.user.username}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="johndoe"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.user.password}
                  onChange={(e) => handleInputChange(e, 'user')}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Agent Details */}
          <div className="border-t border-border pt-6">
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              Agent Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Type *</label>
                <select
                  name="agent_type"
                  value={formData.agent_type}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="individual">Individual Agent</option>
                  <option value="agency">Agency</option>
                  <option value="broker">Broker</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">License Number *</label>
                  <Input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="LIC-2024-001"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">License Expiry *</label>
                  <Input
                    type="date"
                    name="license_expiry"
                    value={formData.license_expiry}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%) *</label>
                <Input
                  type="number"
                  name="commission_rate"
                  value={formData.commission_rate}
                  onChange={handleInputChange}
                  placeholder="15.0"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link href="/dashboard/agents" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Help Text */}
      <Card className="p-4 border border-border bg-blue-50">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> After creating the agent, you&apos;ll need to verify their license and set up their commission structure.
        </p>
      </Card>
    </div>
  );
}
