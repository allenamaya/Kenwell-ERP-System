'use client';

import { useEffect, useState } from 'react';
import { getClaims, getPendingClaims } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Claim {
  id: number;
  claim_number: string;
  policy: {
    id: number;
    policy_number: string;
    customer: {
      first_name: string;
      last_name: string;
    };
  };
  claim_amount: number;
  claim_date: string;
  status: string;
  priority: string;
  description: string;
  claimed_amount: number;
  approved_amount: number;
  created_at: string;
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        console.log('[v0] Fetching claims');
        let response: any;

        if (showPendingOnly) {
          response = await getPendingClaims();
        } else {
          const params: Record<string, unknown> = {};

          if (searchTerm) {
            params.search = searchTerm;
          }
          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }
          if (priorityFilter !== 'all') {
            params.priority = priorityFilter;
          }

          response = await getClaims(params);
        }

        setClaims(Array.isArray(response) ? response : response.results || []);
      } catch (error) {
        console.error('[v0] Failed to fetch claims:', error);
        setClaims([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchClaims, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, priorityFilter, showPendingOnly]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      paid: 'bg-purple-100 text-purple-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-orange-600',
      high: 'text-red-600',
      critical: 'text-red-800 font-bold',
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Claims Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Process and manage insurance claims
          </p>
        </div>
        <Link href="/dashboard/claims/new">
          <Button className="bg-primary text-white hover:bg-primary/90">
            + Submit New Claim
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by claim or policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              disabled={showPendingOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              disabled={showPendingOnly}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              disabled={showPendingOnly}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm font-medium">Pending Only</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Claims List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">Loading claims...</p>
          </Card>
        ) : claims.length > 0 ? (
          claims.map((claim) => (
            <Link
              key={claim.id}
              href={`/dashboard/claims/${claim.id}`}
              className="block"
            >
              <Card className="p-4 border border-border hover:bg-accent/5 transition cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  {/* Claim Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {claim.claim_number}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        claim.priority === 'critical' ? 'bg-red-100' :
                        claim.priority === 'high' ? 'bg-orange-100' :
                        claim.priority === 'medium' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        {claim.priority.charAt(0).toUpperCase() + claim.priority.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium text-foreground">
                          {claim.policy.customer.first_name}{' '}
                          {claim.policy.customer.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Policy</p>
                        <p className="font-medium text-foreground">
                          {claim.policy.policy_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Claimed</p>
                        <p className="font-medium text-primary">
                          ${claim.claimed_amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Approved</p>
                        <p className="font-medium text-secondary">
                          ${claim.approved_amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Claim Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(claim.claim_date).toLocaleDateString()}
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
            <p className="text-muted-foreground">No claims found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or submit a new claim
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
