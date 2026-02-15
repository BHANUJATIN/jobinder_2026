"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useFolders from "@/hooks/useFolders";
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
import { Loader2 } from "lucide-react";

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#6366F1"];

export default function CreateFolderModal({ open, onClose, editFolder }) {
  const { createFolder, updateFolder } = useFolders();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: editFolder?.name || "",
    description: editFolder?.description || "",
    color: editFolder?.color || "#3B82F6",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editFolder) {
        await updateFolder(editFolder.id, form);
        toast.success("Folder updated");
      } else {
        await createFolder(form);
        toast.success("Folder created");
      }
      setForm({ name: "", description: "", color: "#3B82F6" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editFolder ? "Edit Folder" : "Create New Folder"}</DialogTitle>
          <DialogDescription>
            {editFolder ? "Update your folder details" : "Organize your job searches into folders"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="e.g., Tech Roles, Client X Jobs"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this folder..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-lg transition ${
                    form.color === color ? "ring-2 ring-offset-2 ring-blue-600" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editFolder ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
