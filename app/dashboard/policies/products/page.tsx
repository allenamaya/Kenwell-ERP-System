"use client";

import { useEffect, useState } from "react";
import { getInsuranceProducts, apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Product {
  id: number;
  product_name: string;
  product_type: string;
  category: string;
  description: string;
  minimum_premium: string;
  maximum_premium: string;
  is_active: boolean;
  policy_count?: number;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    product_type: "motor",
    category: "auto",
    description: "",
    minimum_premium: "",
    maximum_premium: "",
    is_active: true,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log("[v0] Fetching products");
      const params: Record<string, unknown> = {};

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      const response: any = await getInsuranceProducts(params);
      setProducts(
        Array.isArray(response) ? response : response.results || [],
      );
    } catch (error) {
      console.error("[v0] Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const debounceTimer = setTimeout(fetchProducts, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, categoryFilter, user]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: "",
      product_type: "motor",
      category: "auto",
      description: "",
      minimum_premium: "",
      maximum_premium: "",
      is_active: true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_type: product.product_type,
      category: product.category,
      description: product.description,
      minimum_premium: product.minimum_premium,
      maximum_premium: product.maximum_premium,
      is_active: product.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await apiClient.delete(`/api/products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const minPrem = parseFloat(formData.minimum_premium);
    const maxPrem = parseFloat(formData.maximum_premium);

    if (isNaN(minPrem) || minPrem < 0) {
      setFormError("Minimum premium must be a positive number.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(maxPrem) || maxPrem < minPrem) {
      setFormError("Maximum premium must be greater than or equal to minimum premium.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingProduct) {
        // Update
        const updated = await apiClient.patch(`/api/products/${editingProduct.id}/`, formData);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? (updated as any) : p)));
      } else {
        // Create
        const created = await apiClient.post("/api/products/", formData);
        setProducts((prev) => [created as any, ...prev]);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "auto",
    "home",
    "health",
    "life",
    "travel",
    "business",
    "disability",
  ];

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

  const isAdminOrOps = user?.role === "admin" || user?.role === "operations";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/policies"
            className="text-sm text-primary hover:underline mb-2 inline-block animate-fade-in"
          >
            ← Back to Policies
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Insurance Products Catalog
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure premium levels, active coverages, and product classifications.
          </p>
        </div>
        {isAdminOrOps && (
          <Button
            onClick={handleOpenAddModal}
            className="bg-primary text-white hover:bg-primary/90 font-semibold"
          >
            + Add New Product
          </Button>
        )}
      </div>

      {/* Filters (only show if we have products or are searching) */}
      {(products.length > 0 || searchTerm !== "" || categoryFilter !== "all") && (
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
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const minPrem = parseFloat(product.minimum_premium) || 0;
            const maxPrem = parseFloat(product.maximum_premium) || 0;

            return (
              <Card
                key={product.id}
                className="p-6 border border-border hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          {getProductTypeIcon(product.product_type)}
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.product_name}
                          </h3>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      {product.is_active ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2 text-sm pt-3 border-t border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium Range:</span>
                      <span className="font-semibold text-primary">
                        KSh {minPrem.toLocaleString()} - KSh {maxPrem.toLocaleString()}
                      </span>
                    </div>
                    {product.policy_count !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Policies Count:</span>
                        <span className="font-semibold text-foreground">
                          {product.policy_count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-6">
                  {isAdminOrOps ? (
                    <>
                      <Button
                        onClick={() => handleOpenEditModal(product)}
                        variant="outline"
                        className="flex-1 text-primary border-primary/20 hover:bg-primary hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Link
                      href={`/dashboard/policies/new?product=${product.id}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-primary text-white hover:bg-primary/90">
                        Create Policy
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-card/40 border border-dashed border-border rounded-xl max-w-xl mx-auto p-8 animate-fade-in space-y-4">
          <div className="text-5xl">📦</div>
          <h3 className="text-xl font-bold text-foreground">No insurance products available</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Insurance products will be displayed here once added by an administrator. Check back soon for coverages.
          </p>
          {isAdminOrOps && (
            <Button
              onClick={handleOpenAddModal}
              className="bg-primary text-white hover:bg-primary/95 font-semibold"
            >
              + Create First Product
            </Button>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <Card className="bg-background border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add New Insurance Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Product Name *</label>
                <Input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Comprehensive Motor Insurance"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Product Type *</label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    disabled={isSubmitting}
                  >
                    <option value="motor">Motor Insurance</option>
                    <option value="travel">Travel Insurance</option>
                    <option value="health">Health Insurance</option>
                    <option value="fire">Fire & General</option>
                    <option value="liability">Public Liability</option>
                    <option value="marine">Marine Insurance</option>
                    <option value="accident">Personal Accident</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    disabled={isSubmitting}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Provide detailed description of coverages..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Min Premium */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Min Premium (KSh) *</label>
                  <Input
                    type="number"
                    name="minimum_premium"
                    value={formData.minimum_premium}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Max Premium */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Max Premium (KSh) *</label>
                  <Input
                    type="number"
                    name="maximum_premium"
                    value={formData.maximum_premium}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                  Product is active and available for requests
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-border justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
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
                  {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
