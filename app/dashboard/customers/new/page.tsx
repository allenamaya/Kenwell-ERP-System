'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerType, setCustomerType] = useState('individual');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    identification_number: '',
    customer_type: 'individual',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    date_of_birth: '',
    company_name: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'customer_type') {
      setCustomerType(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[v0] Creating new customer:', formData);
      await createCustomer(formData);
      router.push('/dashboard/customers');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create customer. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/customers"
          className="text-sm text-primary hover:underline mb-2 inline-block"
        >
          ← Back to Customers
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Register New Customer
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new customer to the system
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Type *
            </label>
            <select
              name="customer_type"
              value={customerType}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              {customerType === 'individual' ? 'Personal' : 'Company'} Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {customerType === 'individual' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="ABC Corporation"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="border-t border-border pt-6">
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              Identification
            </h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                {customerType === 'individual'
                  ? 'ID / SSN / Passport *'
                  : 'Tax ID / EIN *'}
              </label>
              <Input
                type="text"
                name="identification_number"
                value={formData.identification_number}
                onChange={handleInputChange}
                placeholder={
                  customerType === 'individual'
                    ? '123-45-6789'
                    : '12-3456789'
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t border-border pt-6">
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    maxLength={2}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP</label>
                  <Input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="10001"
                    disabled={isLoading}
                  />
                </div>
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
            <Link href="/dashboard/customers" className="flex-1">
              <Button variant="outline" className="w-full" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              {isLoading ? 'Registering...' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
