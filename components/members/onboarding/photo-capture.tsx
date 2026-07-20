"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import styles from "./onboarding.module.css";

type PhotoCaptureProps = {
  photoPreview: string | null;
  onPreviewChange: (preview: string | null) => void;
  onPhotoUrlChange: (url: string | null) => void;
};

type PhotoMode = "upload" | "camera";

export function PhotoCapture({
  photoPreview,
  onPreviewChange,
  onPhotoUrlChange,
}: PhotoCaptureProps) {
  const { supabase, gymId } = useGym();
  const [mode, setMode] = useState<PhotoMode>("upload");
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (mode !== "camera") {
      stopCamera();
      return;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch {
        setCameraActive(false);
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mode, stopCamera]);

  async function uploadBlob(blob: Blob) {
    if (!gymId) return;
    setUploading(true);
    try {
      const id = crypto.randomUUID();
      const path = `${gymId}/${id}.webp`;
      const { error } = await supabase.storage
        .from("member-photos")
        .upload(path, blob, { contentType: blob.type, upsert: false });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("member-photos").getPublicUrl(path);

      onPhotoUrlChange(publicUrl);
    } catch {
      onPhotoUrlChange(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    onPreviewChange(preview);
    await uploadBlob(file);
  }

  async function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const preview = URL.createObjectURL(blob);
      onPreviewChange(preview);
      stopCamera();
      await uploadBlob(blob);
    }, "image/webp", 0.9);
  }

  function handleRetake() {
    onPreviewChange(null);
    onPhotoUrlChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (mode === "camera") {
      setMode("camera");
    }
  }

  return (
    <div>
      <div className={styles.photoTabs}>
        <button
          type="button"
          className={`${styles.photoTab} ${mode === "upload" ? styles.photoTabActive : ""}`}
          onClick={() => setMode("upload")}
        >
          <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Upload
        </button>
        <button
          type="button"
          className={`${styles.photoTab} ${mode === "camera" ? styles.photoTabActive : ""}`}
          onClick={() => setMode("camera")}
        >
          <Camera size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Camera
        </button>
      </div>

      <div className={styles.photoPreview}>
        {photoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="Member preview" />
        ) : mode === "camera" && cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted />
        ) : (
          <span style={{ fontSize: 12, color: "#a0a096", textAlign: "center", padding: 12 }}>
            {mode === "camera" ? "Starting camera…" : "No photo yet"}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <div className={styles.photoActions}>
        {mode === "upload" && !photoPreview ? (
          <button
            type="button"
            className={`${styles.photoActionBtn} ${styles.photoActionBtnPrimary}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Browse files"}
          </button>
        ) : null}

        {mode === "camera" && !photoPreview && cameraActive ? (
          <button
            type="button"
            className={`${styles.photoActionBtn} ${styles.photoActionBtnPrimary}`}
            onClick={handleCapture}
            disabled={uploading}
          >
            Capture
          </button>
        ) : null}

        {photoPreview ? (
          <button
            type="button"
            className={styles.photoActionBtn}
            onClick={handleRetake}
            disabled={uploading}
          >
            Retake
          </button>
        ) : null}
      </div>
    </div>
  );
}
