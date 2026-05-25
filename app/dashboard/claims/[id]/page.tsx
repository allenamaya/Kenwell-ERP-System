'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ChevronLeft, Download, Upload } from 'lucide-react';
import Link from 'next/link';

interface Claim {
  id: number;
  claim_number: string;
  policy: number;
  customer: number;
  status: string;
  priority: string;
  claim_amount: number;
  approved_amount: number;
  claim_date: string;
  incident_date: string;
  incident_description: string;
  location_of_incident: string;
  third_party_involved: boolean;
  police_report_filed: boolean;
}

export default function ClaimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await api.get(`/claims/${id}/`);
        setClaim(response.data);
      } catch (error) {
        console.error('Failed to fetch claim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center">Loading claim details...</div>;
  }

  if (!claim) {
    return <div className="p-6 text-center text-red-600">Claim not found</div>;
  }

  const statusColor: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    pending_documents: 'bg-orange-100 text-orange-800',
  };

  const priorityColor: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/claims">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold">{claim.claim_number}</h1>
            <p className="text-muted-foreground">Claim Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColor[claim.status] || 'bg-gray-100'}>
            {claim.status.toUpperCase()}
          </Badge>
          <Badge className={priorityColor[claim.priority] || 'bg-gray-100'}>
            {claim.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Claim Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {claim.claim_amount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">KES {claim.approved_amount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Claim Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{new Date(claim.claim_date).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Incident Date</p>
                  <p className="font-semibold">{new Date(claim.incident_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="font-semibold">{claim.location_of_incident || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{claim.incident_description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Third Party Involved</p>
                  <p className="font-semibold">{claim.third_party_involved ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Police Report Filed</p>
                  <p className="font-semibold">{claim.police_report_filed ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Supporting Documents</CardTitle>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Documents will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Assessment information will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                    <p className="font-semibold">Pending</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">Bank Transfer</p>
                  </div>
                </div>
                <Button className="w-full bg-primary">Process Payment</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
