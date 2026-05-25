'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomer, apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Customer {
  id: number;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  identification_number: string;
  customer_type: string;
  status: string;
  date_of_birth?: string;
  company_name?: string;
  created_at: string;
}

interface CustomerData {
  total_policies: number;
  active_policies: number;
  total_claims: number;
  total_interactions: number;
  policies: any[];
  claims: any[];
  interactions: any[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[v0] Fetching customer data for ID:', customerId);
        const custData = await getCustomer(parseInt(customerId));
        setCustomer(custData);

        // Fetch related data
        try {
          const summary = await apiClient.get(
            `/api/customers/${customerId}/summary/`
          );
          setCustomerData(summary as any);
        } catch (err) {
          console.log('[v0] Summary endpoint not available');
        }
      } catch (err) {
        console.error('[v0] Failed to fetch customer:', err);
        setError('Failed to load customer details');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <Card className="p-8 border border-border text-center">
          <p className="text-red-600">{error || 'Customer not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/customers"
            className="text-sm text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Customers
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">{customer.customer_id}</p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : customer.status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Details */}
        <Card className="p-6 border border-border lg:col-span-2">
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Customer Information
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-foreground mb-3">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground break-all">
                    {customer.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium text-foreground">{customer.phone}</p>
                </div>
              </div>
            </div>

            {customer.address && (
              <div>
                <h3 className="font-medium text-foreground mb-3">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Street</p>
                    <p className="font-medium text-foreground">{customer.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">City</p>
                    <p className="font-medium text-foreground">{customer.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">State</p>
                    <p className="font-medium text-foreground">{customer.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ZIP Code</p>
                    <p className="font-medium text-foreground">{customer.zip_code}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-foreground mb-3">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium text-foreground capitalize">
                    {customer.customer_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ID Number</p>
                  <p className="font-medium text-foreground">
                    {customer.identification_number}
                  </p>
                </div>
                {customer.date_of_birth && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                    <p className="font-medium text-foreground">
                      {new Date(customer.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-medium text-foreground">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="space-y-4">
          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Policies</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {customerData?.total_policies || 0}
            </p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Active Policies</p>
            <p className="font-heading text-3xl font-bold text-secondary">
              {customerData?.active_policies || 0}
            </p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Claims</p>
            <p className="font-heading text-3xl font-bold text-orange-500">
              {customerData?.total_claims || 0}
            </p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Interactions</p>
            <p className="font-heading text-3xl font-bold text-accent">
              {customerData?.total_interactions || 0}
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Policies */}
      {customerData?.policies && customerData.policies.length > 0 && (
        <Card className="p-6 border border-border">
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Active Policies
          </h2>
          <div className="space-y-2">
            {customerData.policies.map((policy: any) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-3 bg-background rounded border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{policy.policy_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {policy.product_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    ${policy.premium_amount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires:{' '}
                    {new Date(policy.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/customers">
          <Button variant="outline">← Back to Customers</Button>
        </Link>
        <Button className="bg-primary text-white hover:bg-primary/90">
          Edit Customer
        </Button>
        <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          Add Policy
        </Button>
      </div>
    </div>
  );
}
