import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status) {
  const colors = {
    new: "bg-blue-100 text-blue-800",
    viewed: "bg-yellow-100 text-yellow-800",
    applied: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getSourceBadge(source) {
  if (source === "linkedin") return "bg-blue-600 text-white";
  if (source === "indeed") return "bg-purple-600 text-white";
  return "bg-gray-600 text-white";
}
