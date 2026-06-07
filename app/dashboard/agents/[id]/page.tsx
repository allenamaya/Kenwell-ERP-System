'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgent, getAgentPerformance, getAgentCommissions } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Agent {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  agent_code: string;
  agent_type: string;
  license_number: string;
  license_expiry: string;
  status: string;
  total_policies: number;
  total_commission: number;
  commission_rate: number;
  bank_details?: string;
  created_at: string;
}

interface AgentPerformance {
  active_policies: number;
  lapsed_policies: number;
  total_clients: number;
  customer_satisfaction_rating: number;
  claims_processed: number;
  average_policy_value: number;
}

interface Commission {
  id: number;
  period_start: string;
  period_end: string;
  amount: number;
  status: string;
  payment_date?: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[v0] Fetching agent data for ID:', agentId);
        const [agentData, perfData, commData] = await Promise.all([
          getAgent(parseInt(agentId)),
          getAgentPerformance(parseInt(agentId)).catch(() => null),
          getAgentCommissions(parseInt(agentId)).catch(() => []),
        ]);

        setAgent(agentData as any);
        setPerformance(perfData as any);
        setCommissions(Array.isArray(commData) ? commData : []);
      } catch (err) {
        console.error('[v0] Failed to fetch agent:', err);
        setError('Failed to load agent details');
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchData();
    }
  }, [agentId]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading agent details...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <Card className="p-8 border border-border text-center">
          <p className="text-red-600">{error || 'Agent not found'}</p>
        </Card>
      </div>
    );
  }

  const isLicenseExpiring = new Date(agent.license_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/agents" className="text-sm text-primary hover:underline mb-2 inline-block">
            ← Back to Agents
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {agent.user.first_name} {agent.user.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">{agent.agent_code}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            agent.status === 'active' ? 'bg-green-100 text-green-800' :
            agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
      </div>

      {/* License Warning */}
      {isLicenseExpiring && (
        <Card className="p-4 border border-yellow-200 bg-yellow-50">
          <p className="text-yellow-800 font-medium">
            ⚠️ License expires on {new Date(agent.license_expiry).toLocaleDateString()}
          </p>
        </Card>
      )}

      {/* Agent Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & License */}
        <Card className="p-6 border border-border lg:col-span-2">
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Agent Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-foreground">{agent.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium text-foreground">{agent.user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Agent Type</p>
                <p className="font-medium text-foreground capitalize">{agent.agent_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                <p className="font-medium text-foreground">{agent.commission_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">License Number</p>
                <p className="font-medium text-foreground">{agent.license_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">License Expiry</p>
                <p className="font-medium text-foreground">
                  {new Date(agent.license_expiry).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="space-y-4">
          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Policies</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {agent.total_policies}
            </p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Commission</p>
            <p className="font-heading text-2xl font-bold text-secondary">
              KSh {agent.total_commission?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Member Since</p>
            <p className="font-medium text-foreground">
              {new Date(agent.created_at).toLocaleDateString()}
            </p>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <Card className="p-6 border border-border">
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Active Policies</p>
              <p className="font-bold text-lg text-foreground">{performance.active_policies}</p>
            </div>
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Lapsed Policies</p>
              <p className="font-bold text-lg text-orange-600">{performance.lapsed_policies}</p>
            </div>
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
              <p className="font-bold text-lg text-foreground">{performance.total_clients}</p>
            </div>
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Satisfaction Rating</p>
              <p className="font-bold text-lg text-yellow-500">
                ⭐ {performance.customer_satisfaction_rating?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Claims Processed</p>
              <p className="font-bold text-lg text-foreground">{performance.claims_processed}</p>
            </div>
            <div className="p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground mb-1">Avg Policy Value</p>
              <p className="font-bold text-lg text-primary">
                KSh {performance.average_policy_value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Commission History */}
      <Card className="p-6 border border-border">
        <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
          Recent Commissions
        </h2>
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b border-border hover:bg-background/50">
                    <td className="py-3 px-4 text-sm">
                      {new Date(commission.period_start).toLocaleDateString()} - {new Date(commission.period_end).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary">
                      KSh {commission.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                        commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      {commission.payment_date ? new Date(commission.payment_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No commission records found</p>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/agents">
          <Button variant="outline">← Back to Agents</Button>
        </Link>
        <Button className="bg-primary text-white hover:bg-primary/90">
          Edit Agent
        </Button>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
          Suspend Agent
        </Button>
      </div>
    </div>
  );
}
