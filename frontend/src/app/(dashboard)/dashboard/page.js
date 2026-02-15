"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import useFolders from "@/hooks/useFolders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Table2, Briefcase, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { folders } = useFolders();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/users/usage-stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const statCards = [
    { label: "Folders", value: stats?.folders || 0, icon: FolderOpen, color: "text-blue-600 bg-blue-100" },
    { label: "Tables", value: stats?.tables || 0, icon: Table2, color: "text-purple-600 bg-purple-100" },
    { label: "Total Jobs", value: stats?.jobs || 0, icon: Briefcase, color: "text-green-600 bg-green-100" },
    {
      label: "Jobs This Month",
      value: stats?.subscription?.jobsFetchedThisMonth || 0,
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your job aggregation activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription info */}
      {stats?.subscription && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Current Plan: <span className="capitalize text-blue-600">{stats.subscription.plan}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.subscription.jobsFetchedThisMonth} / {stats.subscription.maxJobsPerMonth || "Unlimited"} jobs
                  fetched this month
                </p>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">Manage Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Folders</h2>
        </div>

        {folders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No folders yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first folder to start organizing job searches
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Link key={folder.id} href={`/folders/${folder.id}`}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: folder.color || "#3B82F6" }}
                      />
                      <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                    </div>
                    {folder.description && (
                      <p className="text-sm text-gray-500 truncate mb-3">{folder.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {folder._count?.tables || 0} tables
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
