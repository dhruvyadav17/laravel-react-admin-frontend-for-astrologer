// NEW FEATURE: Reusable image upload component
// Usage:
//   <ImageUpload
//     currentUrl={form.profile_image}
//     onUpload={(url) => set("profile_image", url)}
//     name="Rahul Sharma"
//   />
//
// Features:
// - Click avatar to open file picker
// - Drag & drop support
// - Preview before upload
// - Upload progress indicator
// - 2MB size validation client-side
// - Auto-calls POST /upload/image API
// - Returns public URL to parent

import { useRef, useState, useCallback } from "react";
import api from "../../core/api/axios";

type Props = {
  currentUrl?: string | null;
  onUpload:    (url: string) => void;
  name?:       string;
  size?:       number;       // avatar size in px (default 80)
  disabled?:   boolean;
};

export default function ImageUpload({
  currentUrl,
  onUpload,
  name     = "",
  size     = 80,
  disabled = false,
}: Props) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [preview, setPreview]  = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const initials = name.slice(0, 2).toUpperCase() || "?";
  const avatarUrl = preview || currentUrl;

  /* -- File validation --------------------------- */
  const validateFile = (file: File): string | null => {
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      return "Only JPG, PNG, or WebP images allowed";
    }
    if (file.size > 2 * 1024 * 1024) {
      return "Image must be under 2MB";
    }
    return null;
  };

  /* -- Upload handler ---------------------------- */
  const handleFile = useCallback(async (file: File) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }

    setError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = res.data?.data?.url;
      if (url) {
        onUpload(url);
        setPreview(null); // use the real URL now
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onUpload]);

  /* -- Drag & drop ------------------------------- */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2">

      {/* Avatar / Drop zone */}
      <div
        style={{
          width:        size,
          height:       size,
          borderRadius: "50%",
          cursor:       disabled ? "default" : "pointer",
          position:     "relative",
          border:       dragOver ? "2px dashed #0d6efd" : "2px dashed #dee2e6",
          transition:   "border-color 0.2s",
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        title={disabled ? "" : "Click or drag image to upload"}
      >
        {/* Avatar image or initials */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            style={{
              width: size, height: size,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: size, height: size,
              borderRadius: "50%",
              background: "#0d6efd",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: size * 0.3,
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        {!disabled && (
          <div
            style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: uploading ? 1 : 0,
              transition: "opacity 0.2s",
            }}
            className="upload-overlay"
          >
            {uploading ? (
              <span
                className="spinner-border spinner-border-sm text-white"
                style={{ width: size * 0.25, height: size * 0.25 }}
              />
            ) : (
              <i className="fas fa-camera text-white" style={{ fontSize: size * 0.25 }} />
            )}
          </div>
        )}
      </div>

      {/* Upload hint */}
      {!disabled && (
        <small className="t-muted text-center" style={{ fontSize: 11 }}>
          {uploading ? "Uploading..." : "Click or drag to upload . Max 2MB . JPG/PNG/WebP"}
        </small>
      )}

      {/* Error */}
      {error && (
        <small className="text-danger text-center" style={{ fontSize: 11 }}>
          <i className="fas fa-exclamation-circle me-1" />
          {error}
        </small>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />

      {/* Hover effect via style tag */}
      <style>{`
        div:hover .upload-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
