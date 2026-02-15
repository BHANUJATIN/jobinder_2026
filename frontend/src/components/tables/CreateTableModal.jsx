"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useTables from "@/hooks/useTables";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function CreateTableModal({ open, onClose, folderId }) {
  const router = useRouter();
  const { createTable } = useTables();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    scheduleFrequency: "daily",
    scheduleTime: "09:00",
    jobKeywords: "",
    jobLocation: "",
    aiFilterInstructions: "",
    includeLinkedin: true,
    includeIndeed: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createTable({
        folderId,
        name: form.name,
        scheduleFrequency: form.scheduleFrequency,
        scheduleTime: form.scheduleTime,
        searchConfig: {
          jobKeywords: form.jobKeywords,
          jobLocation: form.jobLocation,
          aiFilterInstructions: form.aiFilterInstructions || undefined,
          includeLinkedin: form.includeLinkedin,
          includeIndeed: form.includeIndeed,
        },
      });
      toast.success("Table created!");
      setForm({
        name: "",
        scheduleFrequency: "daily",
        scheduleTime: "09:00",
        jobKeywords: "",
        jobLocation: "",
        aiFilterInstructions: "",
        includeLinkedin: true,
        includeIndeed: true,
      });
      onClose();
      router.push(`/tables/${result.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>Configure a job search with automated scheduling</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              placeholder="e.g., Senior Python Engineers - Remote"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Job Keywords</Label>
            <Input
              id="keywords"
              placeholder="e.g., python developer, backend engineer"
              value={form.jobKeywords}
              onChange={(e) => setForm({ ...form, jobKeywords: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">Comma-separated keywords</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Job Location</Label>
            <Input
              id="location"
              placeholder="e.g., Remote, New York, NY"
              value={form.jobLocation}
              onChange={(e) => setForm({ ...form, jobLocation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiFilter">AI Filter Instructions (optional)</Label>
            <Textarea
              id="aiFilter"
              placeholder='e.g., "Only remote positions with salary > $100k, exclude contract roles"'
              value={form.aiFilterInstructions}
              onChange={(e) => setForm({ ...form, aiFilterInstructions: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-gray-500">Natural language instructions for AI-powered filtering</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schedule Frequency</Label>
              <Select
                value={form.scheduleFrequency}
                onValueChange={(value) => setForm({ ...form, scheduleFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Schedule Time</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={form.scheduleTime}
                onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sources</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.includeLinkedin}
                  onChange={(e) => setForm({ ...form, includeLinkedin: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                LinkedIn
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.includeIndeed}
                  onChange={(e) => setForm({ ...form, includeIndeed: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                Indeed
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Table
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
