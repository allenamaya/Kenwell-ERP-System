"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getInsuranceProducts,
  getCustomers,
  getAgents,
  createPolicy,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Product {
  id: number;
  product_name: string;
  base_premium: number;
  coverage_limit: number;
}

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
}

interface Agent {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
}

function NewPolicyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get("product");

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customer: "",
    product: preselectedProductId || "",
    agent: "",
    start_date: "",
    end_date: "",
    premium_amount: "",
    coverage_amount: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching products, customers, and agents");
        const [productsRes, customersRes, agentsRes] = await Promise.all([
          getInsuranceProducts(),
          getCustomers({}),
          getAgents({}),
        ]);

        const productsData = productsRes as any;
        const customersData = customersRes as any;
        const agentsData = agentsRes as any;

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData.results || [],
        );
        setCustomers(
          Array.isArray(customersData)
            ? customersData
            : customersData.results || [],
        );
        setAgents(
          Array.isArray(agentsData) ? agentsData : agentsData.results || [],
        );

        // Pre-select product if provided
        if (preselectedProductId) {
          const product = (
            Array.isArray(productsData)
              ? productsData
              : productsData.results || []
          ).find((p: any) => p.id === parseInt(preselectedProductId));
          if (product) {
            setSelectedProduct(product);
            const minPrem = parseFloat((product as any).minimum_premium) || 0;
            setFormData((prev) => ({
              ...prev,
              premium_amount: minPrem.toString(),
              coverage_amount: (minPrem * 10).toString(),
            }));
          }
        }
      } catch (err) {
        console.error("[v0] Failed to fetch data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [preselectedProductId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "product") {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        setSelectedProduct(product);
        const minPrem = parseFloat((product as any).minimum_premium) || 0;
        setFormData((prev) => ({
          ...prev,
          premium_amount: minPrem.toString(),
          coverage_amount: (minPrem * 10).toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log("[v0] Creating new policy:", formData);
      await createPolicy({
        customer: parseInt(formData.customer),
        product: parseInt(formData.product),
        agent: parseInt(formData.agent),
        start_date: formData.start_date,
        end_date: formData.end_date,
        premium_amount: parseFloat(formData.premium_amount),
        coverage_amount: parseFloat(formData.coverage_amount),
      });
      router.push("/dashboard/policies");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create policy. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading policy creation form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/policies"
          className="text-sm text-primary hover:underline mb-2 inline-block"
        >
          ← Back to Policies
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Create New Policy
        </h1>
        <p className="text-muted-foreground mt-2">
          Issue a new insurance policy to a customer
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection Section */}
          <div>
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              Policy Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product *
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select a product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} - KSh {parseFloat((product as any).minimum_premium || "0").toLocaleString()} - KSh {parseFloat((product as any).maximum_premium || "0").toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer *
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Agent *
                </label>
                <select
                  name="agent"
                  value={formData.agent}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.user.first_name} {agent.user.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Coverage */}
          <div className="border-t border-border pt-6">
            <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
              Coverage & Premium
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Premium Amount *
                  </label>
                  <Input
                    type="number"
                    name="premium_amount"
                    value={formData.premium_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coverage Amount *
                  </label>
                  <Input
                    type="number"
                    name="coverage_amount"
                    value={formData.coverage_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details (Read-only) */}
          {selectedProduct && (
            <div className="border-t border-border pt-6">
              <h2 className="font-heading text-lg font-bold mb-4 text-foreground">
                Product Information
              </h2>
              <Card className="p-4 bg-background border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Product</p>
                    <p className="font-medium text-foreground">
                      {selectedProduct.product_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Premium Range</p>
                    <p className="font-medium text-primary">
                      KSh {parseFloat((selectedProduct as any).minimum_premium || "0").toLocaleString()} - KSh {parseFloat((selectedProduct as any).maximum_premium || "0").toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link href="/dashboard/policies" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? "Creating..." : "Create Policy"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
export default function NewPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <NewPolicyPageContent />
    </Suspense>
  );
}
