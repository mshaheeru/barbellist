"use client";

import { useEffect, useRef } from "react";

type VideoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function VideoModal({ open, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    video?.play().catch(() => {});
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Barbellist demo video"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(23, 29, 40, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 960,
          margin: "auto",
          background: "#173D28",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 32px 80px -20px rgba(0,0,0,.55)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,.15)",
            color: "#fff",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
        <video
          ref={videoRef}
          src="/barbellist.mp4"
          controls
          playsInline
          style={{
            display: "block",
            width: "100%",
            aspectRatio: "16 / 9",
            background: "#000",
          }}
        />
      </div>
    </div>
  );
}
