"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, CreditCard, Check } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    companyName: user?.companyName || "",
  });

  useEffect(() => {
    api.get("/subscriptions/plans").then(({ data }) => setPlans(data)).catch(() => {});
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/users/me", form);
      updateUser(data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const { data } = await api.post("/subscriptions/checkout", {
        planId,
        billingCycle: "monthly",
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start checkout");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await api.post("/subscriptions/cancel");
      toast.success("Subscription cancelled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </CardTitle>
          <CardDescription>
            Current plan: <span className="capitalize font-medium text-blue-600">{user?.subscriptionTier || "free"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans
              .filter((p) => p.id !== "enterprise")
              .map((plan) => {
                const isCurrent = user?.subscriptionTier === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 ${isCurrent ? "border-blue-600 bg-blue-50/50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-3">
                      ${plan.priceMonthly ? plan.priceMonthly / 100 : 0}
                      <span className="text-sm font-normal text-gray-500">/mo</span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-4">
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-blue-600" />
                        {plan.maxFolders || "Unlimited"} folders
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-blue-600" />
                        {plan.maxTables || "Unlimited"} tables
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-blue-600" />
                        {plan.maxJobsPerMonth ? `${plan.maxJobsPerMonth.toLocaleString()} jobs/mo` : "Unlimited jobs"}
                      </li>
                    </ul>
                    {isCurrent ? (
                      plan.id !== "free" && (
                        <Button variant="outline" size="sm" className="w-full text-red-600" onClick={handleCancel}>
                          Cancel Plan
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        variant={plan.id === "free" ? "outline" : "default"}
                        onClick={() => plan.id !== "free" && handleUpgrade(plan.id)}
                        disabled={plan.id === "free"}
                      >
                        {plan.id === "free" ? "Free" : "Upgrade"}
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
