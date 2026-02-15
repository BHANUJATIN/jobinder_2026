"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import useFolders from "@/hooks/useFolders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateFolderModal from "@/components/folders/CreateFolderModal";
import CreateTableModal from "@/components/tables/CreateTableModal";
import {
  Table2,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Play,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function FolderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { deleteFolder } = useFolders();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [showCreateTable, setShowCreateTable] = useState(false);

  const fetchFolder = async () => {
    try {
      const { data } = await api.get(`/folders/${id}`);
      setFolder(data);
    } catch {
      toast.error("Folder not found");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolder();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this folder and all its tables? This cannot be undone.")) return;
    try {
      await deleteFolder(id);
      toast.success("Folder deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  const handleRunNow = async (tableId) => {
    try {
      await api.post(`/tables/${tableId}/run-now`);
      toast.success("Job fetch queued!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to queue job fetch");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!folder) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div
            className="w-5 h-5 rounded"
            style={{ backgroundColor: folder.color || "#3B82F6" }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
            {folder.description && (
              <p className="text-sm text-gray-500 mt-0.5">{folder.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditFolder(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Tables */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
        <Button size="sm" onClick={() => setShowCreateTable(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Table
        </Button>
      </div>

      {(!folder.tables || folder.tables.length === 0) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Table2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tables yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a table to start searching for jobs
            </p>
            <Button onClick={() => setShowCreateTable(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create First Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {folder.tables.map((table) => (
            <Card key={table.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/tables/${table.id}`} className="font-medium text-gray-900 hover:text-blue-600 truncate">
                        {table.name}
                      </Link>
                      <Badge variant={table.isActive ? "default" : "secondary"} className="text-xs">
                        {table.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {table.scheduleFrequency}
                      </span>
                      <span>{table._count?.jobs || 0} jobs</span>
                      {table.lastRunAt && (
                        <span>Last run: {new Date(table.lastRunAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleRunNow(table.id)} title="Run now">
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/tables/${table.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showEditFolder && (
        <CreateFolderModal
          open={showEditFolder}
          onClose={() => {
            setShowEditFolder(false);
            fetchFolder();
          }}
          editFolder={folder}
        />
      )}

      <CreateTableModal
        open={showCreateTable}
        onClose={() => {
          setShowCreateTable(false);
          fetchFolder();
        }}
        folderId={id}
      />
    </div>
  );
}
