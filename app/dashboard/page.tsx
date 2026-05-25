'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import {
  getAgents,
  getCustomers,
  getPolicies,
  getClaims,
  getOutstandingInvoices,
  getTopPerformers,
} from '@/lib/api';

interface DashboardStats {
  totalAgents: number;
  totalCustomers: number;
  activePolicies: number;
  pendingClaims: number;
  outstandingInvoices: number;
  topPerformers: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalCustomers: 0,
    activePolicies: 0,
    pendingClaims: 0,
    outstandingInvoices: 0,
    topPerformers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('[v0] Fetching dashboard data');

        // Fetch data based on user role
        if (user?.role === 'admin' || user?.role === 'operations') {
          const [agents, customers, policies, claims, invoices, topPerformers] =
            await Promise.all([
              getAgents({ limit: 1 }).catch(() => ({ count: 0 })),
              getCustomers({ limit: 1 }).catch(() => ({ count: 0 })),
              getPolicies({ status: 'active', limit: 1 }).catch(() => ({ count: 0 })),
              getClaims({ status: 'submitted', limit: 1 }).catch(() => ({ count: 0 })),
              getOutstandingInvoices().catch(() => []),
              getTopPerformers(5).catch(() => []),
            ]);

          setStats({
            totalAgents: agents.count || 0,
            totalCustomers: customers.count || 0,
            activePolicies: policies.count || 0,
            pendingClaims: claims.count || 0,
            outstandingInvoices: Array.isArray(invoices) ? invoices.length : 0,
            topPerformers: Array.isArray(topPerformers) ? topPerformers : [],
          });
        }
      } catch (error) {
        console.error('[v0] Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s your insurance agency overview
        </p>
      </div>

      {/* Stats Grid */}
      {(user?.role === 'admin' || user?.role === 'operations') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
                <p className="font-heading text-3xl font-bold text-primary">
                  {isLoading ? '-' : stats.totalAgents}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Customers
                </p>
                <p className="font-heading text-3xl font-bold text-secondary">
                  {isLoading ? '-' : stats.totalCustomers}
                </p>
              </div>
              <div className="text-3xl">👤</div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Policies
                </p>
                <p className="font-heading text-3xl font-bold text-accent">
                  {isLoading ? '-' : stats.activePolicies}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Pending Claims
                </p>
                <p className="font-heading text-3xl font-bold text-orange-500">
                  {isLoading ? '-' : stats.pendingClaims}
                </p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Outstanding
                </p>
                <p className="font-heading text-3xl font-bold text-red-500">
                  {isLoading ? '-' : stats.outstandingInvoices}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {(user?.role === 'admin' || user?.role === 'operations') && !isLoading && (
        <Card className="p-6 border border-border">
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Top Performing Agents
          </h2>
          {stats.topPerformers.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformers.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-background rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {agent.user?.first_name} {agent.user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.agent_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ${agent.total_commission?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {agent.total_policies} policies
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No agents data available
            </p>
          )}
        </Card>
      )}

      {/* Quick Links */}
      <Card className="p-6 border border-border">
        <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(user?.role === 'admin' || user?.role === 'operations') && (
            <>
              <button className="p-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium">
                Add New Agent
              </button>
              <button className="p-4 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition font-medium">
                Register Customer
              </button>
              <button className="p-4 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition font-medium">
                Create Policy
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
