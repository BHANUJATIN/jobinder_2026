"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate, getStatusColor, getSourceBadge } from "@/lib/utils";
import {
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  Brain,
} from "lucide-react";

export default function JobDetailModal({ job, onClose, onStatusChange }) {
  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{job.jobTitle}</DialogTitle>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", getSourceBadge(job.source))}>
                  {job.source}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-md", getStatusColor(job.status))}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3">
            {job.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.companyName}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.location}</span>
              </div>
            )}
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.salaryRange}</span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.jobType}</span>
              </div>
            )}
            {(job.postedDate || job.createdAt) && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{formatDate(job.postedDate || job.createdAt)}</span>
              </div>
            )}
          </div>

          {/* AI Filter */}
          {job.aiFilterReason && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-800 mb-1">
                <Brain className="h-4 w-4" />
                AI Filter: {job.aiFilterPassed ? "Passed" : "Failed"}
              </div>
              <p className="text-sm text-purple-700">{job.aiFilterReason}</p>
            </div>
          )}

          {/* Description */}
          {job.jobDescription && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4">
                {job.jobDescription}
              </div>
            </div>
          )}

          {/* Status change */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
            <div className="flex gap-2 flex-wrap">
              {["new", "viewed", "applied", "archived", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={job.status === status ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => onStatusChange(job.id, status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full" variant="default">
                <ExternalLink className="h-4 w-4 mr-2" /> View Original Listing
              </Button>
            </a>
            {job.companyLinkedinUrl && (
              <a href={job.companyLinkedinUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" /> Company
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
