'use client';

import { useEffect, useState } from 'react';
import { getPolicies, getExpiringPolicies } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Policy {
  id: number;
  policy_number: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
  };
  product: {
    id: number;
    product_name: string;
  };
  agent: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  status: string;
  start_date: string;
  end_date: string;
  premium_amount: number;
  created_at: string;
}

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        console.log('[v0] Fetching policies');
        let response: any;

        if (showExpiringOnly) {
          response = await getExpiringPolicies();
          let list = Array.isArray(response) ? response : response.results || [];
          if (user?.role === 'customer' && user.customer_id) {
            list = list.filter((p: any) => p.customer?.id === user.customer_id || p.customer === user.customer_id);
          }
          setPolicies(list);
        } else {
          const params: Record<string, unknown> = {};

          if (searchTerm) {
            params.search = searchTerm;
          }
          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }
          if (user?.role === 'customer' && user.customer_id) {
            params.customer = user.customer_id;
          }

          response = await getPolicies(params);
          setPolicies(Array.isArray(response) ? response : response.results || []);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch policies:', error);
        setPolicies([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      const debounceTimer = setTimeout(fetchPolicies, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, statusFilter, showExpiringOnly, user]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      lapsed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isExpiringSoon = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Policy Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage insurance policies and coverage
          </p>
        </div>
        {user?.role === 'customer' ? (
          <Link href="/dashboard/policies/browse">
            <Button className="bg-primary text-white hover:bg-primary/90">
              + Browse Products
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/policies/new">
            <Button className="bg-primary text-white hover:bg-primary/90">
              + Create New Policy
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by policy number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              disabled={showExpiringOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              disabled={showExpiringOnly}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lapsed">Lapsed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExpiringOnly}
                onChange={(e) => setShowExpiringOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm font-medium">Expiring Soon</span>
            </label>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              {policies.length} polic{policies.length !== 1 ? 'ies' : 'y'} found
            </p>
          </div>
        </div>
      </Card>

      {/* Policies List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">Loading policies...</p>
          </Card>
        ) : policies.length > 0 ? (
          policies.map((policy) => (
            <Link
              key={policy.id}
              href={`/dashboard/policies/${policy.id}`}
              className="block"
            >
              <Card className="p-4 border border-border hover:bg-accent/5 transition cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  {/* Policy Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {policy.policy_number}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(policy.status)}`}
                      >
                        {policy.status.charAt(0).toUpperCase() +
                          policy.status.slice(1)}
                      </span>
                      {isExpiringSoon(policy.end_date) && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          ⏰ Expiring Soon
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium text-foreground">
                          {policy.customer ? `${policy.customer.first_name} ${policy.customer.last_name}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Product</p>
                        <p className="font-medium text-foreground">
                          {policy.product?.product_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Agent</p>
                        <p className="font-medium text-foreground">
                          {policy.agent ? `${policy.agent.user?.first_name || ''} ${policy.agent.user?.last_name || ''}` : <span className="text-muted-foreground italic">Direct</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-medium text-primary font-semibold">
                          KSh {policy.premium_amount?.toLocaleString() || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium text-foreground">
                          {new Date(policy.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    View
                  </Button>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">No policies found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
