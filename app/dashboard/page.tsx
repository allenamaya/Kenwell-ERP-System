'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getAgents,
  getCustomers,
  getPolicies,
  getClaims,
  getOutstandingInvoices,
  getTopPerformers,
  apiClient,
} from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalAgents: number;
  totalCustomers: number;
  activePolicies: number;
  pendingClaims: number;
  outstandingInvoices: number;
  topPerformers: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Admin stats
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalCustomers: 0,
    activePolicies: 0,
    pendingClaims: 0,
    outstandingInvoices: 0,
    topPerformers: [],
  });

  // Customer stats & list
  const [customerPolicies, setCustomerPolicies] = useState<any[]>([]);
  const [customerClaims, setCustomerClaims] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log('[v0] Dashboard: Starting fetch for user:', user?.username, 'Role:', user?.role);

        // Fetch data based on user role
        if (user?.role === 'admin' || user?.role === 'operations') {
          console.log('[v0] Dashboard: User is admin/operations, fetching data...');
          
          const [agents, customers, policies, claims, invoices, topPerformers] =
            await Promise.all([
              getAgents().catch((err) => {
                console.error('[v0] Dashboard: getAgents error:', err);
                return {};
              }),
              getCustomers().catch((err) => {
                console.error('[v0] Dashboard: getCustomers error:', err);
                return {};
              }),
              getPolicies({ status: 'active' }).catch((err) => {
                console.error('[v0] Dashboard: getPolicies error:', err);
                return {};
              }),
              getClaims({ status: 'submitted' }).catch((err) => {
                console.error('[v0] Dashboard: getClaims error:', err);
                return {};
              }),
              getOutstandingInvoices().catch((err) => {
                console.error('[v0] Dashboard: getOutstandingInvoices error:', err);
                return [];
              }),
              getTopPerformers(5).catch((err) => {
                console.error('[v0] Dashboard: getTopPerformers error:', err);
                return [];
              }),
            ]) as [any, any, any, any, any, any];

          const agentCount = agents.count !== undefined ? agents.count : Array.isArray(agents) ? agents.length : 0;
          const customerCount = customers.count !== undefined ? customers.count : Array.isArray(customers) ? customers.length : 0;
          const policyCount = policies.count !== undefined ? policies.count : Array.isArray(policies) ? policies.length : 0;
          const claimCount = claims.count !== undefined ? claims.count : Array.isArray(claims) ? claims.length : 0;

          setStats({
            totalAgents: agentCount,
            totalCustomers: customerCount,
            activePolicies: policyCount,
            pendingClaims: claimCount,
            outstandingInvoices: Array.isArray(invoices) ? invoices.length : 0,
            topPerformers: Array.isArray(topPerformers) ? topPerformers : [],
          });
        } else if (user?.role === 'customer' && user.customer_id) {
          console.log('[v0] Dashboard: User is customer, fetching customer metrics...');
          const [policiesRes, claimsRes, invoicesRes, profileRes] = await Promise.all([
            apiClient.get(`/api/policies/?customer=${user.customer_id}`).catch(() => ({ results: [] })),
            apiClient.get(`/api/claims/?customer=${user.customer_id}`).catch(() => ({ results: [] })),
            apiClient.get(`/api/invoices/?customer=${user.customer_id}`).catch(() => ({ results: [] })),
            apiClient.get(`/api/customers/${user.customer_id}/`).catch(() => null)
          ]);

          const policyList = Array.isArray(policiesRes) ? policiesRes : (policiesRes as any).results || [];
          const claimList = Array.isArray(claimsRes) ? claimsRes : (claimsRes as any).results || [];
          const invoiceList = Array.isArray(invoicesRes) ? invoicesRes : (invoicesRes as any).results || [];

          setCustomerPolicies(policyList);
          setCustomerClaims(claimList);
          setCustomerInvoices(invoiceList);
          setCustomerProfile(profileRes);
        }
      } catch (error) {
        console.error('[v0] Dashboard: Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Customer calculated stats
  const activeCustomerPolicies = customerPolicies.filter(p => p.status === 'active').length;
  const pendingCustomerClaims = customerClaims.filter(c => c.status === 'submitted' || c.status === 'under_review' || c.status === 'pending_documents').length;
  const unpaidCustomerInvoices = customerInvoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {user?.role === 'customer' 
            ? 'Manage your active insurance policies, submit claims, and check pending statements.'
            : 'Here is your insurance agency overview.'}
        </p>
      </div>

      {/* ADMIN & OPERATIONS DASHBOARD */}
      {(user?.role === 'admin' || user?.role === 'operations') && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
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

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="font-heading text-3xl font-bold text-secondary">
                    {isLoading ? '-' : stats.totalCustomers}
                  </p>
                </div>
                <div className="text-3xl">👤</div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Policies</p>
                  <p className="font-heading text-3xl font-bold text-accent">
                    {isLoading ? '-' : stats.activePolicies}
                  </p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Claims</p>
                  <p className="font-heading text-3xl font-bold text-orange-500">
                    {isLoading ? '-' : stats.pendingClaims}
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                  <p className="font-heading text-3xl font-bold text-red-500">
                    {isLoading ? '-' : stats.outstandingInvoices}
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </Card>
          </div>

          {/* Top Performers */}
          {!isLoading && (
            <Card className="p-6 border border-border bg-card shadow-sm">
              <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
                Top Performing Agents
              </h2>
              {stats.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {stats.topPerformers.map((agent, index) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-lg hover:bg-muted/30 transition-colors"
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

          {/* Quick Actions */}
          <Card className="p-6 border border-border bg-card shadow-sm">
            <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/dashboard/agents')}
                className="p-6 h-auto bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-base font-semibold"
              >
                👥 Manage Agents
              </Button>
              <Button
                onClick={() => router.push('/dashboard/customers')}
                className="p-6 h-auto bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-all text-base font-semibold"
              >
                👤 Manage Customers
              </Button>
              <Button
                onClick={() => router.push('/dashboard/policies')}
                className="p-6 h-auto bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all text-base font-semibold"
              >
                📋 View Policies
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* CUSTOMER PORTAL VIEW */}
      {user?.role === 'customer' && (
        <>
          {/* Customer Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">My Active Policies</p>
                  <p className="font-heading text-3xl font-bold text-emerald-500">
                    {isLoading ? '-' : activeCustomerPolicies}
                  </p>
                </div>
                <div className="text-3xl text-emerald-500">🛡</div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Claims</p>
                  <p className="font-heading text-3xl font-bold text-orange-500">
                    {isLoading ? '-' : pendingCustomerClaims}
                  </p>
                </div>
                <div className="text-3xl text-orange-500">📝</div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unpaid Invoices</p>
                  <p className="font-heading text-3xl font-bold text-red-500">
                    {isLoading ? '-' : unpaidCustomerInvoices}
                  </p>
                </div>
                <div className="text-3xl text-red-500">🧾</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Policies List (Left Side) */}
            <Card className="col-span-2 p-6 border border-border bg-card shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-xl font-bold text-foreground">My Insurance Policies</h2>
                <Link href="/dashboard/billing">
                  <Button variant="outline" size="sm" className="text-xs text-primary border-primary hover:bg-primary hover:text-white">
                    Pay Premium
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <p className="text-muted-foreground text-sm py-4 text-center">Loading policies...</p>
              ) : customerPolicies.length > 0 ? (
                <div className="space-y-3">
                  {customerPolicies.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-all">
                      <div>
                        <p className="font-semibold text-foreground">{p.policy_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Expires: {new Date(p.end_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          p.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-6 text-center">No active policies found. Contact an agent to purchase coverage.</p>
              )}
            </Card>

            {/* Right Side Info & Quick Actions */}
            <div className="space-y-6">
              {/* Agent contact card */}
              <Card className="p-6 border border-border bg-card shadow-sm space-y-4">
                <h2 className="font-heading text-lg font-bold text-foreground">My Assigned Agent</h2>
                {isLoading ? (
                  <p className="text-muted-foreground text-xs animate-pulse">Retrieving agent details...</p>
                ) : customerProfile?.agent ? (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-foreground">
                      {customerProfile.agent.user.first_name} {customerProfile.agent.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Agent Code: {customerProfile.agent.agent_code}</p>
                    <p className="text-muted-foreground">{customerProfile.agent.user.email}</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>No dedicated agent assigned yet.</p>
                    <p className="text-xs">Support Hotline: support@kenwell.com</p>
                  </div>
                )}
              </Card>

              {/* Customer Actions */}
              <Card className="p-6 border border-border bg-card shadow-sm space-y-3">
                <h2 className="font-heading text-lg font-bold text-foreground">Support & Actions</h2>
                <Button 
                  onClick={() => router.push('/dashboard/billing')} 
                  className="w-full bg-primary hover:bg-primary/95 text-white"
                >
                  Pay Invoices & Billing
                </Button>
                <Button 
                  onClick={() => alert('Claim filing portal: Please contact your assigned agent or email claims@kenwell.com')}
                  variant="outline" 
                  className="w-full border-border hover:bg-accent/10"
                >
                  Submit a Claim
                </Button>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
