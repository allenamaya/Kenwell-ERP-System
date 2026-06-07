'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

interface Invoice {
  id: number;
  invoice_number: string;
  customer: number;
  customer_display: string;
  policy: number | null;
  invoice_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  notes: string;
  sent_date: string | null;
  created_at: string;
  updated_at: string;
}

interface InvoiceLineItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Receipt {
  id: number;
  receipt_number: string;
  amount: number;
  receipt_date: string;
  payment_method: string;
  reference_number: string;
  status: string;
  notes: string;
}

interface InvoiceDetail extends Invoice {
  line_items: InvoiceLineItem[];
  receipts: Receipt[];
}

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Detail modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (!authLoading && (!user || !(user.role === 'admin' || user.role === 'operations' || user.role === 'finance' || user.role === 'customer'))) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // Fetch only customer invoices if the logged-in user is a customer
        let url = '/api/invoices/';
        if (user?.role === 'customer' && user.customer_id) {
          url = `/api/invoices/?customer=${user.customer_id}`;
        }

        const response: any = await apiClient.get(url);
        const invoiceList = Array.isArray(response) ? response : response.results || [];
        // Map backend string decimals to floats safely
        const parsedInvoices = invoiceList.map((inv: any) => ({
          ...inv,
          amount: parseFloat(inv.amount) || 0,
          paid_amount: parseFloat(inv.paid_amount) || 0,
        }));
        setInvoices(parsedInvoices);
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'operations' || user.role === 'finance' || user.role === 'customer')) {
      fetchInvoices();
    }
  }, [user]);

  const handleViewDetails = async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail: any = await apiClient.get(`/api/invoices/${id}/`);
      setSelectedInvoice({
        ...detail,
        amount: parseFloat(detail.amount) || 0,
        paid_amount: parseFloat(detail.paid_amount) || 0,
        line_items: (detail.line_items || []).map((item: any) => ({
          ...item,
          unit_price: parseFloat(item.unit_price) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        receipts: (detail.receipts || []).map((rec: any) => ({
          ...rec,
          amount: parseFloat(rec.amount) || 0,
        })),
      });
    } catch (err) {
      console.error('Failed to load invoice details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Metrics Calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.paid_amount, 0);
  const outstandingAmount = totalInvoiced - totalPaid;

  // Filtering Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer_display && inv.customer_display.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const badgeStyles = {
      draft: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      sent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      overdue: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      cancelled: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with rich font style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Billing & Invoices
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Monitor invoices, process receipts, and view financial statements.
          </p>
        </div>
      </div>

      {/* Modern metrics cards with gradients and smooth shadows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden p-6 border border-border bg-card/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Invoiced</p>
          <p className="text-3xl font-bold text-foreground">
            KSh {totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <span>All generated invoices</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 border border-border bg-card/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all group-hover:scale-110" />
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Received</p>
          <p className="text-3xl font-bold text-emerald-500">
            KSh {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-xs text-emerald-500/80 flex items-center gap-1">
            <span>✓ Total cleared payments</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 border border-border bg-card/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full transition-all group-hover:scale-110" />
          <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding Balance</p>
          <p className="text-3xl font-bold text-orange-500">
            KSh {outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-xs text-orange-500/80 flex items-center gap-1">
            <span>⚠ Unpaid/Overdue balance</span>
          </div>
        </Card>
      </div>

      {/* Filters section */}
      <Card className="p-5 border border-border bg-card/40 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3 relative">
            <Input
              placeholder={user?.role === 'customer' ? "Search by invoice number..." : "Search by invoice number or customer ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 pl-10"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          </div>

          <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
            <span className="text-sm text-muted-foreground font-medium">Status:</span>
            {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`capitalize transition-all duration-200 ${
                  statusFilter === status ? 'bg-primary text-white hover:bg-primary/95' : 'hover:bg-accent/10'
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table section */}
      <Card className="overflow-hidden border border-border bg-card shadow-md">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Fetching billing records...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-left">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice ID</th>
                  {user?.role !== 'customer' && (
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer ID</th>
                  )}
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Amount</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border hover:bg-accent/5 transition-colors duration-150"
                  >
                    <td className="p-4 text-sm font-semibold text-foreground">{inv.invoice_number}</td>
                    {user?.role !== 'customer' && (
                      <td className="p-4 text-sm text-foreground">{inv.customer_display || 'N/A'}</td>
                    )}
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(inv.invoice_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(inv.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="p-4 text-sm font-bold text-foreground">
                      KSh {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-sm">{getStatusBadge(inv.status)}</td>
                    <td className="p-4 text-sm text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(inv.id)}
                        className="text-primary border-primary/30 hover:bg-primary hover:text-white"
                        disabled={loadingDetail}
                      >
                        {loadingDetail ? 'Loading...' : 'View Detail'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-sm">No invoices match your selection.</p>
          </div>
        )}
      </Card>

      {/* Premium Detail Modal/Drawer Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-fade-in">
          <div className="bg-background border border-border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Invoice {selectedInvoice.invoice_number}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated on {new Date(selectedInvoice.invoice_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedInvoice.status)}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 hover:bg-accent/15 rounded-full transition-colors text-muted-foreground hover:text-foreground font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Billing Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground"><span className="text-muted-foreground">Customer Ref:</span> {selectedInvoice.customer_display}</p>
                    <p className="text-foreground"><span className="text-muted-foreground">Due Date:</span> {new Date(selectedInvoice.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    {selectedInvoice.description && (
                      <p className="text-foreground"><span className="text-muted-foreground">Description:</span> {selectedInvoice.description}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h4>
                  <div className="space-y-1 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold text-foreground">KSh {selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-semibold text-emerald-500">KSh {selectedInvoice.paid_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between font-bold text-foreground">
                      <span>Outstanding:</span>
                      <span className="text-orange-500">KSh {(selectedInvoice.amount - selectedInvoice.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Line Items</h4>
                  <div className="border border-border rounded-lg overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-left">
                          <th className="p-3 font-semibold text-muted-foreground">Item Description</th>
                          <th className="p-3 font-semibold text-muted-foreground text-center">Qty</th>
                          <th className="p-3 font-semibold text-muted-foreground text-right">Unit Price</th>
                          <th className="p-3 font-semibold text-muted-foreground text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.line_items.map((item) => (
                          <tr key={item.id} className="border-b border-border last:border-0">
                            <td className="p-3 text-foreground">{item.description}</td>
                            <td className="p-3 text-center text-foreground">{item.quantity}</td>
                            <td className="p-3 text-right text-foreground">KSh {item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-semibold text-foreground">KSh {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Receipts & Payments */}
              {selectedInvoice.receipts && selectedInvoice.receipts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Receipts & Payment History</h4>
                  <div className="space-y-3">
                    {selectedInvoice.receipts.map((rec) => (
                      <div key={rec.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-emerald-500/5 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">Receipt #{rec.receipt_number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Via {rec.payment_method} ({rec.reference_number || 'No reference'})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-500">+KSh {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(rec.receipt_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedInvoice(null)}
                className="hover:bg-accent/15"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
