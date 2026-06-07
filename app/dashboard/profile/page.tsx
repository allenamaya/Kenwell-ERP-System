"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string | null;
  role: string;
  customer_id?: number;
}

interface CustomerData {
  id: number;
  customer_type: string;
  customer_id: string;
  phone: string;
  email: string;
  identification_type: string;
  identification_number: string;
  date_of_birth: string | null;
  status: string;
  kra_pin: string;
  kra_pin_document: string | null;
}

export default function ProfilePage() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  // Forms states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [dob, setDob] = useState("");
  const [kraPin, setKraPin] = useState("");

  // Error/Success statuses
  const [userMsg, setUserMsg] = useState({ text: "", type: "" });
  const [customerMsg, setCustomerMsg] = useState({ text: "", type: "" });
  const [uploadMsg, setUploadMsg] = useState({ text: "", type: "" });
  const [dangerMsg, setDangerMsg] = useState("");

  // Loading indicator for operations
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "suspend" | "delete" | null }>({
    open: false,
    type: null,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const userRes: UserProfileData = await apiClient.get("/api/users/me/");
      setProfileData(userRes);
      setFirstName(userRes.first_name || "");
      setLastName(userRes.last_name || "");
      setEmail(userRes.email || "");
      setPhone(userRes.phone || "");

      // Fetch customer details if role is customer and customer_id exists
      if (userRes.role === "customer" && userRes.customer_id) {
        const custRes: CustomerData = await apiClient.get(`/api/customers/${userRes.customer_id}/`);
        setCustomerData(custRes);
        setDob(custRes.date_of_birth || "");
        setKraPin(custRes.kra_pin || "");
      }
    } catch (err: any) {
      setUserMsg({ text: err.message || "Failed to load profile details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle Basic User Details Update
  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg({ text: "", type: "" });
    setIsUpdatingUser(true);
    try {
      const updated: UserProfileData = await apiClient.patch("/api/users/me/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
      });
      setProfileData(updated);
      setUserMsg({ text: "User profile details updated successfully!", type: "success" });
      await refresh();
    } catch (err: any) {
      setUserMsg({ text: err.message || "Failed to update user details", type: "error" });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Handle Customer Details Update
  const handleUpdateCustomerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerMsg({ text: "", type: "" });
    setIsUpdatingCustomer(true);
    if (!profileData?.customer_id) return;
    try {
      const updated: CustomerData = await apiClient.patch(
        `/api/customers/${profileData.customer_id}/`,
        {
          date_of_birth: dob || null,
          kra_pin: kraPin,
        }
      );
      setCustomerData(updated);
      setCustomerMsg({ text: "KRA PIN and Date of Birth updated successfully!", type: "success" });
    } catch (err: any) {
      setCustomerMsg({ text: err.message || "Failed to update customer details", type: "error" });
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg({ text: "", type: "" });
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      const updated: UserProfileData = await apiClient.patch("/api/users/me/", formData);
      setProfileData(updated);
      setUploadMsg({ text: "Profile picture uploaded successfully!", type: "success" });
      await refresh();
    } catch (err: any) {
      setUploadMsg({ text: err.message || "Failed to upload photo", type: "error" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle KRA PIN Document Upload
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg({ text: "", type: "" });
    setIsUploadingDoc(true);
    if (!profileData?.customer_id) return;
    try {
      const formData = new FormData();
      formData.append("kra_pin_document", file);
      const updated: CustomerData = await apiClient.patch(
        `/api/customers/${profileData.customer_id}/`,
        formData
      );
      setCustomerData(updated);
      setUploadMsg({ text: "KRA PIN Document uploaded successfully!", type: "success" });
    } catch (err: any) {
      setUploadMsg({ text: err.message || "Failed to upload KRA PIN document", type: "error" });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle Deactivation/Suspension
  const handleConfirmDeactivate = async () => {
    setDangerMsg("");
    try {
      await apiClient.delete("/api/users/me/");
      setConfirmModal({ open: false, type: null });
      await logout();
      router.push("/login");
    } catch (err: any) {
      setDangerMsg(err.message || "Failed to deactivate account. Contact support.");
    }
  };

  // Helper to format file path
  const getFullFilePath = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const getInitials = () => {
    const f = firstName.charAt(0).toUpperCase();
    const l = lastName.charAt(0).toUpperCase();
    return f && l ? `${f}${l}` : "KU";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage your personal details, credentials, verification documents, and active profile status.
        </p>
      </div>

      {uploadMsg.text && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            uploadMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {uploadMsg.text}
        </div>
      )}

      {/* Main Profile Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Photo and Status Card */}
        <Card className="p-6 border border-border bg-card/60 backdrop-blur-md flex flex-col items-center space-y-6">
          <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground shadow-inner relative">
              {profileData?.profile_picture ? (
                <img
                  src={getFullFilePath(profileData.profile_picture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials()}</span>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold rounded-full">
                {isUploadingPhoto ? "Uploading..." : "Change Photo 📷"}
              </div>
            </div>
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-heading text-xl font-bold text-foreground">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Role: {profileData?.role}
            </p>
            {customerData && (
              <p className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-2">
                ID: {customerData.customer_id}
              </p>
            )}
          </div>

          <div className="w-full border-t border-border/60 pt-4 flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Active Account
              </span>
            </div>
          </div>
        </Card>

        {/* User Details Form Card */}
        <Card className="p-6 md:col-span-2 border border-border bg-card/60 backdrop-blur-md space-y-6">
          <h3 className="font-heading text-lg font-bold text-foreground border-b border-border/50 pb-2">
            Personal Details
          </h3>
          <form onSubmit={handleUpdateUserDetails} className="space-y-4">
            {userMsg.text && (
              <div
                className={`p-3 rounded-lg border text-sm ${
                  userMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {userMsg.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 700 000000"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingUser}
              className="bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
            >
              {isUpdatingUser ? "Saving..." : "Save Personal Details"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Customer Verification Section (Only for Customers) */}
      {profileData?.role === "customer" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          {/* Verification Files Card */}
          <Card className="p-6 border border-border bg-card/60 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground border-b border-border/50 pb-2 mb-4">
                KRA PIN Document
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Please upload a copy of your Kenya Revenue Authority (KRA) PIN certificate for official policy billing operations.
              </p>
              {customerData?.kra_pin_document ? (
                <div className="p-3 bg-muted/50 rounded-lg border border-border/60 text-xs flex items-center justify-between">
                  <span className="truncate font-semibold text-primary/80">📄 KRA_PIN_Document.pdf</span>
                  <a
                    href={getFullFilePath(customerData.kra_pin_document)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    View File
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
                  ⚠️ No KRA PIN document uploaded yet.
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={isUploadingDoc}
                variant="outline"
                className="w-full text-primary border-primary/20 hover:bg-primary/5 mt-4"
              >
                {isUploadingDoc ? "Uploading..." : "Upload Document"}
              </Button>
              <input
                type="file"
                ref={docInputRef}
                onChange={handleDocUpload}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
            </div>
          </Card>

          {/* Customer Specific Fields Card */}
          <Card className="p-6 md:col-span-2 border border-border bg-card/60 backdrop-blur-md space-y-6">
            <h3 className="font-heading text-lg font-bold text-foreground border-b border-border/50 pb-2">
              Verification Details
            </h3>
            <form onSubmit={handleUpdateCustomerDetails} className="space-y-4">
              {customerMsg.text && (
                <div
                  className={`p-3 rounded-lg border text-sm ${
                    customerMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {customerMsg.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">KRA PIN Number</label>
                <Input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                  placeholder="e.g. A012345678Z"
                  maxLength={11}
                  className="font-mono bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingCustomer}
                className="bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
              >
                {isUpdatingCustomer ? "Saving..." : "Save Verification Details"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Danger Zone Section */}
      <Card className="p-6 border border-red-200 bg-red-50/20 backdrop-blur-md space-y-6">
        <h3 className="font-heading text-lg font-bold text-red-700 border-b border-red-200 pb-2">
          Danger Zone
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h4 className="font-bold text-foreground text-sm">Deactivate / Suspend Your Account</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deactivating or suspending your account will immediately disable your login credentials and set your profile status to inactive. Active policy coverage contracts will require manual operations reviews.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setConfirmModal({ open: true, type: "suspend" })}
              variant="outline"
              className="text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              Suspend Account
            </Button>
            <Button
              type="button"
              onClick={() => setConfirmModal({ open: true, type: "delete" })}
              variant="outline"
              className="text-red-700 border-red-200 hover:bg-red-100"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <Card className="bg-background border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-red-500/10 to-amber-500/10 border-b border-border">
              <h3 className="text-xl font-bold text-red-800">
                Confirm Account {confirmModal.type === "suspend" ? "Suspension" : "Deactivation"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {dangerMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {dangerMsg}
                </div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you absolutely sure you want to {confirmModal.type === "suspend" ? "suspend" : "deactivate/delete"}{" "}
                your account?
              </p>
              <p className="text-xs text-red-600 font-semibold leading-relaxed">
                ⚠️ This action will immediately sign you out and revoke your access. You will not be able to log back into the ERP dashboard without administrative override.
              </p>

              <div className="flex gap-3 pt-4 border-t border-border justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setConfirmModal({ open: false, type: null });
                    setDangerMsg("");
                  }}
                  className="hover:bg-accent/10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Confirm & Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
