'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  description: string;
  category: string;
  base_premium: number;
  coverage_limit: number;
  min_coverage: number;
  max_coverage: number;
  is_active: boolean;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('[v0] Fetching products');
        const params: Record<string, unknown> = {};

        if (searchTerm) {
          params.search = searchTerm;
        }
        if (categoryFilter !== 'all') {
          params.category = categoryFilter;
        }

        const response: any = await getProducts(params);
        setProducts(Array.isArray(response) ? response : response.results || []);
      } catch (error) {
        console.error('[v0] Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter]);

  const categories = [
    'auto',
    'home',
    'health',
    'life',
    'travel',
    'business',
    'disability',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/policies" className="text-sm text-primary hover:underline mb-2 inline-block">
            ← Back to Policies
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Insurance Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse available insurance products and coverage options
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              className="p-6 border border-border hover:shadow-lg transition"
            >
              <div className="space-y-4">
                {/* Product Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {product.product_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.product_code}
                      </p>
                    </div>
                    {product.is_active ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground bg-background p-2 rounded mt-2">
                    {product.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-foreground capitalize">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Premium:</span>
                    <span className="font-medium text-primary">
                      ${product.base_premium?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Limit:</span>
                    <span className="font-medium text-foreground">
                      ${product.coverage_limit?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Range:</span>
                    <span className="font-medium text-foreground">
                      ${product.min_coverage?.toLocaleString() || '0'} -{' '}
                      ${product.max_coverage?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/dashboard/policies/new?product=${product.id}`}
                  className="block"
                >
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    Create Policy
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Card className="p-8 border border-border inline-block">
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div>
        <Link href="/dashboard/policies">
          <Button variant="outline">← Back to Policies</Button>
        </Link>
      </div>
    </div>
  );
}
