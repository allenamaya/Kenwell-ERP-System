'use client';

import { useEffect, useState } from 'react';
import { getAgents, deleteAgent } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentModal } from '@/components/modals/agent-modal';
import Link from 'next/link';

interface Agent {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  agent_code: string;
  agent_type: string;
  status: string;
  total_policies: number;
  total_commission: number;
  license_expiry: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        console.log('[v0] Fetching agents');
        const params: Record<string, unknown> = {};
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        const response: any = await getAgents(params);
        setAgents(Array.isArray(response) ? response : response.results || []);
      } catch (error) {
        console.error('[v0] Failed to fetch agents:', error);
        setAgents([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAgents, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const handleDeleteAgent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    setIsDeleting(id);
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
    } catch (error) {
      console.error('[v0] Failed to delete agent:', error);
      alert('Failed to delete agent');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenModal = (agent?: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgent(undefined);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Agents Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage insurance agents and brokers
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white hover:bg-primary/90"
        >
          + Add New Agent
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </Card>

      {/* Agents List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">Loading agents...</p>
          </Card>
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <Card key={agent.id} className="p-4 border border-border hover:bg-accent/5 transition">
              <div className="flex items-center justify-between gap-4">
                {/* Agent Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {agent.user.first_name} {agent.user.last_name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Agent Code</p>
                      <p className="font-medium text-foreground">{agent.agent_code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground capitalize">{agent.agent_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Policies</p>
                      <p className="font-medium text-foreground">{agent.total_policies}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission</p>
                      <p className="font-medium text-primary">
                        ${agent.total_commission?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(agent)}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                    disabled={isDeleting === agent.id}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {isDeleting === agent.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">No agents found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search filters
            </p>
          </Card>
        )}
      </div>

      {/* Agent Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          setIsLoading(true);
          // Trigger refresh
          const params: Record<string, unknown> = {};
          if (searchTerm) {
            params.search = searchTerm;
          }
          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }
          getAgents(params).then((response: any) => {
            setAgents(Array.isArray(response) ? response : response.results || []);
            setIsLoading(false);
          });
        }}
        agent={selectedAgent}
      />
    </div>
  );
}
