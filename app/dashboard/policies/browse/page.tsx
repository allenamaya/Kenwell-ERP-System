'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getInsuranceProducts, createPolicy, apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: number;
  product_name: string;
  product_type: string;
  description: string;
  minimum_premium: string;
  maximum_premium: string;
  is_active: boolean;
}

export default function BrowseProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  
  // Selection / Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    premium_amount: '',
    coverage_limit: '',
    start_date: '',
    end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not customer
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'customer')) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchProductsAndProfile = async () => {
      try {
        setLoading(true);
        const [productsRes, profileRes] = await Promise.all([
          getInsuranceProducts(),
          user?.customer_id ? apiClient.get(`/api/customers/${user.customer_id}/`) : Promise.resolve(null),
        ]);

        setProducts(Array.isArray(productsRes) ? productsRes : (productsRes as any).results || []);
        if (profileRes) {
          setCustomerProfile(profileRes);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'customer') {
      fetchProductsAndProfile();
    }
  }, [user]);

  // Set default dates and recommended values when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startStr = tomorrow.toISOString().split('T')[0];

      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      oneYearLater.setDate(oneYearLater.getDate() + 1);
      const endStr = oneYearLater.toISOString().split('T')[0];

      const minPrem = parseFloat(selectedProduct.minimum_premium) || 0;
      const recommendedPrem = minPrem;
      // Recommended coverage limit is typically 10x premium
      const recommendedCoverage = recommendedPrem * 10;

      setFormData({
        premium_amount: recommendedPrem.toString(),
        coverage_limit: recommendedCoverage.toString(),
        start_date: startStr,
        end_date: endStr,
      });
      setFormError('');
    }
  }, [selectedProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update coverage limit if premium changes (10x ratio as helper)
      if (name === 'premium_amount') {
        const prem = parseFloat(value) || 0;
        updated.coverage_limit = (prem * 10).toString();
      }
      
      return updated;
    });
  };

  const handleOpenRequestModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setFormError('');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!selectedProduct || !user?.customer_id) return;

    const minPrem = parseFloat(selectedProduct.minimum_premium);
    const maxPrem = parseFloat(selectedProduct.maximum_premium);
    const chosenPrem = parseFloat(formData.premium_amount);

    if (isNaN(chosenPrem) || chosenPrem < minPrem || chosenPrem > maxPrem) {
      setFormError(
        `Premium amount must be between KSh ${minPrem.toLocaleString()} and KSh ${maxPrem.toLocaleString()}`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        customer: user.customer_id,
        product: selectedProduct.id,
        agent: customerProfile?.agent?.id || null, // Auto-assign their existing agent if available
        start_date: formData.start_date,
        end_date: formData.end_date,
        premium_amount: chosenPrem,
        coverage_limit: parseFloat(formData.coverage_limit) || chosenPrem * 10,
        status: 'inactive', // Policy request starts as inactive (pending approval/activation)
      };

      await createPolicy(payload);
      setSuccessMessage('Your insurance policy request has been successfully submitted!');
      setTimeout(() => {
        handleCloseModal();
        router.push('/dashboard/policies');
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit policy request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      motor: '🚗',
      travel: '✈️',
      health: '🏥',
      fire: '🔥',
      liability: '🛡️',
      marine: '🚢',
      accident: '🤕',
    };
    return icons[type] || '🛡️';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm ml-3">Loading available coverage options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Browse Premium Coverage
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Explore our range of curated insurance products, configure your custom premium, and get protected instantly.
        </p>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const minPrem = parseFloat(product.minimum_premium) || 0;
          const maxPrem = parseFloat(product.maximum_premium) || 0;
          
          return (
            <Card
              key={product.id}
              className="relative overflow-hidden p-6 border border-border bg-card/60 backdrop-blur-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Badge/Icon Header */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {getProductTypeIcon(product.product_type)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary capitalize">
                    {product.product_type}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {product.product_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed min-h-[60px]">
                    {product.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-border/50 text-sm">
                  <p className="text-muted-foreground font-medium mb-1">Premium Range</p>
                  <p className="text-lg font-bold text-foreground">
                    KSh {minPrem.toLocaleString()} - KSh {maxPrem.toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal"> / year</span>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => handleOpenRequestModal(product)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
                >
                  Configure & Get Protected
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Request Form Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-fade-in">
          <Card className="bg-background border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Request {selectedProduct.product_name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your premium rate and coverage duration.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1 text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              {successMessage ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-center font-medium animate-pulse">
                  {successMessage}
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  {/* Pricing reference */}
                  <div className="p-3 bg-muted/40 rounded-lg border border-border text-sm flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Min Premium</p>
                      <p className="font-bold text-foreground">
                        KSh {(parseFloat(selectedProduct.minimum_premium) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Max Premium</p>
                      <p className="font-bold text-foreground">
                        KSh {(parseFloat(selectedProduct.maximum_premium) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Premium Amount */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Choose Premium Amount (KSh) *
                    </label>
                    <Input
                      type="number"
                      name="premium_amount"
                      value={formData.premium_amount}
                      onChange={handleInputChange}
                      required
                      min={parseFloat(selectedProduct.minimum_premium)}
                      max={parseFloat(selectedProduct.maximum_premium)}
                      step="1"
                      disabled={isSubmitting}
                      className="w-full bg-background"
                    />
                  </div>

                  {/* Coverage Limit */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Coverage Limit (KSh) *
                    </label>
                    <Input
                      type="number"
                      name="coverage_limit"
                      value={formData.coverage_limit}
                      onChange={handleInputChange}
                      required
                      min="1"
                      disabled={isSubmitting}
                      className="w-full bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 10x premium value (adjusted automatically if premium changes).
                    </p>
                  </div>

                  {/* Start Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Start Date *
                      </label>
                      <Input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        End Date *
                      </label>
                      <Input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-background text-sm"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3 pt-4 border-t border-border justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="hover:bg-accent/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/95 text-white"
                    >
                      {isSubmitting ? 'Requesting...' : 'Request Policy'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
