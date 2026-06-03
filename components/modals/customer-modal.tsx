'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCustomer, updateCustomer } from '@/lib/api';

interface Customer {
  id?: number;
  customer_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_type: string;
  status: string;
  identification_number?: string;
  identification_type?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  date_of_birth?: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer;
}

export function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_type: 'individual',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        customer_type: 'individual',
        status: 'active',
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (customer?.id) {
        await updateCustomer(customer.id, formData);
      } else {
        await createCustomer(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer');
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
              {customer ? 'Edit Customer' : 'Add New Customer'}
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
                  value={formData.first_name || ''}
                  onChange={handleChange}
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
                  value={formData.last_name || ''}
                  onChange={handleChange}
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
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="Enter email"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Customer Type</label>
                <select
                  name="customer_type"
                  value={formData.customer_type || 'individual'}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {/* Identification Type */}
              <div>
                <label className="block text-sm font-medium mb-2">ID Type</label>
                <select
                  name="identification_type"
                  value={formData.identification_type || 'national_id'}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver License</option>
                  <option value="tax_number">Tax Number</option>
                </select>
              </div>

              {/* Identification Number */}
              <div>
                <label className="block text-sm font-medium mb-2">ID Number</label>
                <Input
                  name="identification_number"
                  value={formData.identification_number || ''}
                  onChange={handleChange}
                  placeholder="Enter ID number"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <Input
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  disabled={isLoading}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  placeholder="Enter city"
                  disabled={isLoading}
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Input
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  placeholder="Enter country"
                  disabled={isLoading}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <Input
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange}
                  placeholder="Enter postal code"
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
                  <option value="prospect">Prospect</option>
                </select>
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
                {isLoading ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
