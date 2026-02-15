"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import useTables from "@/hooks/useTables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import { cn, formatDate, getStatusColor, getSourceBadge } from "@/lib/utils";
import {
  Play,
  Download,
  Trash2,
  ArrowLeft,
  Search,
  ExternalLink,
  Clock,
  Briefcase,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Pause,
} from "lucide-react";

export default function TablePage() {
  const { id } = useParams();
  const router = useRouter();
  const { deleteTable, updateTable } = useTables();
  const [table, setTable] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    source: "all",
    page: 1,
  });

  const fetchTable = useCallback(async () => {
    try {
      const { data } = await api.get(`/tables/${id}`);
      setTable(data);
    } catch {
      toast.error("Table not found");
      router.push("/dashboard");
    }
  }, [id, router]);

  const fetchJobs = useCallback(async () => {
    try {
      const params = { page: filters.page, limit: 25 };
      if (filters.search) params.search = filters.search;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.source !== "all") params.source = filters.source;

      const { data } = await api.get(`/jobs/table/${id}`, { params });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRunNow = async () => {
    try {
      await api.post(`/tables/${id}/run-now`);
      toast.success("Job fetch queued!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to queue");
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateTable(id, { isActive: !table.isActive });
      setTable({ ...table, isActive: !table.isActive });
      toast.success(table.isActive ? "Table paused" : "Table activated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this table and all its jobs? This cannot be undone.")) return;
    try {
      await deleteTable(id);
      toast.success("Table deleted");
      router.back();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleExport = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/export/${id}?format=csv&token=${localStorage.getItem("accessToken")}`,
      "_blank"
    );
  };

  const handleStatusChange = async (jobId, status) => {
    try {
      await api.post(`/jobs/${jobId}/mark-status`, { status });
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status } : j)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!table) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{table.name}</h1>
              <Badge variant={table.isActive ? "default" : "secondary"}>
                {table.isActive ? "Active" : "Paused"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {table.scheduleFrequency}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> {table._count?.jobs || 0} jobs
              </span>
              {table.folder && (
                <span>in {table.folder.name}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRunNow}>
            <Play className="h-3.5 w-3.5 mr-1" /> Run Now
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {table.isActive ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
            {table.isActive ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Search Config summary */}
      {table.searchConfig && (
        <Card>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Keywords:</span>
                <p className="font-medium">{table.searchConfig.jobKeywords}</p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">{table.searchConfig.jobLocation}</p>
              </div>
              <div>
                <span className="text-gray-500">Sources:</span>
                <p className="font-medium">
                  {[
                    table.searchConfig.includeLinkedin && "LinkedIn",
                    table.searchConfig.includeIndeed && "Indeed",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              {table.searchConfig.aiFilterInstructions && (
                <div className="sm:col-span-3">
                  <span className="text-gray-500">AI Filter:</span>
                  <p className="font-medium">{table.searchConfig.aiFilterInstructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.source}
          onValueChange={(v) => setFilters({ ...filters, source: v, page: 1 })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="indeed">Indeed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="text-left font-medium text-gray-500 px-4 py-3">Job Title</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Company</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Location</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Source</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No jobs found. Run the table to fetch jobs.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[250px]">{job.jobTitle}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-600 truncate max-w-[150px]">{job.companyName || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-gray-600 truncate max-w-[150px]">{job.location || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", getSourceBadge(job.source))}>
                        {job.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={job.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(job.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "text-xs px-2 py-1 rounded-md border-0 cursor-pointer",
                          getStatusColor(job.status)
                        )}
                      >
                        <option value="new">New</option>
                        <option value="viewed">Viewed</option>
                        <option value="applied">Applied</option>
                        <option value="archived">Archived</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-gray-500">{formatDate(job.postedDate || job.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * 25 + 1}-{Math.min(pagination.page * 25, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
