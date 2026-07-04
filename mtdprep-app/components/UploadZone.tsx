"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelected, loading, disabled }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || loading || disabled) return;
      onFileSelected(file);
    },
    [onFileSelected, loading, disabled]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload your HSBC PDF bank statement"
      onClick={() => !loading && !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !loading && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!loading && !disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        dragActive
          ? "border-brand bg-brand-light"
          : "border-borderc bg-white hover:border-brand"
      } ${loading || disabled ? "pointer-events-none opacity-70" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-brand" />
          <p className="font-semibold text-body">Reading your statement…</p>
          <p className="text-sm text-slate-500">
            Extracting and categorising every transaction. This usually takes under a minute.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-10 w-10 text-brand"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <path d="M13 2v7h7" />
            <path d="M12 18v-6" />
            <path d="M9 15l3-3 3 3" />
          </svg>
          <p className="font-semibold text-body">
            Drop your HSBC PDF statement here, or click to browse
          </p>
          <p className="text-sm text-slate-500">PDF only · up to 10MB · never stored on our servers</p>
        </div>
      )}
    </div>
  );
}
