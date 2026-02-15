"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import useFolders from "@/hooks/useFolders";
import { Button } from "@/components/ui/button";
import {
  Zap,
  LayoutDashboard,
  FolderOpen,
  Settings,
  Plus,
  ChevronRight,
  X,
} from "lucide-react";
import CreateFolderModal from "@/components/folders/CreateFolderModal";

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { folders } = useFolders();
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-bold">Jobinder</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {/* Folders section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Folders
              </span>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="px-3 text-xs text-gray-400">No folders yet</p>
            ) : (
              <div className="space-y-0.5">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/folders/${folder.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                      pathname === `/folders/${folder.id}`
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: folder.color || "#3B82F6" }}
                    />
                    <span className="truncate">{folder.name}</span>
                    <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0 opacity-40" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowCreateFolder(true)}
          >
            <Plus className="h-4 w-4" /> New Folder
          </Button>
        </div>
      </aside>

      <CreateFolderModal
        open={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
      />
    </>
  );
}
