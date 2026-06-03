'use client';

import { useEffect, useState } from 'react';
import { getCustomers, deleteAgent } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerModal } from '@/components/modals/customer-modal';
import Link from 'next/link';

interface Customer {
  id: number;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_type: string;
  status: string;
  identification_number: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('[v0] Fetching customers');
        const params: Record<string, unknown> = {};

        if (searchTerm) {
          params.search = searchTerm;
        }
        if (customerTypeFilter !== 'all') {
          params.customer_type = customerTypeFilter;
        }
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        const response: any = await getCustomers(params);
        setCustomers(Array.isArray(response) ? response : response.results || []);
      } catch (error) {
        console.error('[v0] Failed to fetch customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, customerTypeFilter, statusFilter]);

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    setIsDeleting(id);
    try {
      // Use the deleteAgent function temporarily until we have deleteCustomer
      await deleteAgent(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error('[v0] Failed to delete customer:', error);
      alert('Failed to delete customer');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(undefined);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      prospect: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage customer relationships and information
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white hover:bg-primary/90"
        >
          + Add New Customer
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="group">Group</option>
            </select>
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
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </Card>

      {/* Customers List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">Loading customers...</p>
          </Card>
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <Card key={customer.id} className="p-4 border border-border hover:bg-accent/5 transition">
              <div className="flex items-center justify-between gap-4">
                {/* Customer Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {customer.customer_id}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ml-auto ${getStatusColor(customer.status)}`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground truncate">{customer.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground capitalize">{customer.customer_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium text-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(customer)}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id!)}
                    disabled={isDeleting === customer.id}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {isDeleting === customer.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 border border-border text-center">
            <p className="text-muted-foreground">No customers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search filters or add a new customer
            </p>
          </Card>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
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
          if (customerTypeFilter !== 'all') {
            params.customer_type = customerTypeFilter;
          }
          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }
          getCustomers(params).then((response: any) => {
            setCustomers(Array.isArray(response) ? response : response.results || []);
            setIsLoading(false);
          });
        }}
        customer={selectedCustomer}
      />
    </div>
  );
}
