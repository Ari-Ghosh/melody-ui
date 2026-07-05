"use client";

import { useState, useRef } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface PhotoUploaderProps {
  onUploadComplete: (url: string) => void;
}

export default function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP files are allowed");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("File must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/user/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploadComplete(data.url);
      toast.success("Photo uploaded");
      setPreview(null);
    } catch {
      toast.error("Failed to upload photo");
      setPreview(null);
    }
    setUploading(false);

    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="photo-upload"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-violet-500"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-1 -right-1 rounded-full bg-zinc-900 border border-zinc-700 p-0.5 text-zinc-400 hover:text-zinc-200"
            aria-label="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor="photo-upload"
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-zinc-800 ring-2 ring-zinc-700 hover:ring-violet-500/50 transition-all"
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          ) : (
            <Upload className="h-6 w-6 text-zinc-500" />
          )}
        </label>
      )}
    </div>
  );
}
