"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewClaimPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policy: "",
    customer: "",
    incident_date: "",
    incident_description: "",
    claim_amount: "",
    location_of_incident: "",
    third_party_involved: false,
    police_report_filed: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post("/claims/", formData);
      router.push("/dashboard/claims");
    } catch (error) {
      console.error("Failed to create claim:", error);
      alert("Failed to create claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/claims">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">New Claim</h1>
          <p className="text-muted-foreground">Submit a new insurance claim</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="policy">Policy Number *</Label>
                <Input
                  id="policy"
                  name="policy"
                  value={formData.policy}
                  onChange={handleChange}
                  placeholder="Enter policy ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer ID *</Label>
                <Input
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  placeholder="Enter customer ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident_date">Incident Date *</Label>
                <Input
                  id="incident_date"
                  name="incident_date"
                  type="date"
                  value={formData.incident_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim_amount">Claim Amount *</Label>
                <Input
                  id="claim_amount"
                  name="claim_amount"
                  type="number"
                  step="0.01"
                  value={formData.claim_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_of_incident">
                  Location of Incident
                </Label>
                <Input
                  id="location_of_incident"
                  name="location_of_incident"
                  value={formData.location_of_incident}
                  onChange={handleChange}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_description">
                Incident Description *
              </Label>
              <Textarea
                id="incident_description"
                name="incident_description"
                value={formData.incident_description}
                onChange={handleChange}
                placeholder="Describe what happened in detail"
                rows={5}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="third_party"
                  name="third_party_involved"
                  checked={formData.third_party_involved}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="third_party"
                  className="font-normal cursor-pointer"
                >
                  Third party involved in incident
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="police"
                  name="police_report_filed"
                  checked={formData.police_report_filed}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="police" className="font-normal cursor-pointer">
                  Police report filed
                </Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/claims">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-primary">
                {loading ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
