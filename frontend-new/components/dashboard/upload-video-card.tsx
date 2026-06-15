"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileVideo,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

type UploadState = "idle" | "uploading" | "transcribing" | "done" | "error";

interface UploadResult {
  id: string;
  title: string;
  videoUrl: string;
  transcript: { time: string; text: string }[];
  transcriptError?: string;
}

export function UploadVideoCard() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useLang();
  const d = t.dashboard.upload;

  const uploadFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setErrorMsg(d.errors.invalidFile);
      setState("error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg(d.errors.loginRequired);
      setState("error");
      return;
    }

    setState("uploading");
    setProgress(0);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append("video", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
        if (pct === 100) setState("transcribing");
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setResult(data);
          setState("done");
        } else {
          setErrorMsg(data.message || d.errors.processingFailed);
          setState("error");
        }
      } catch {
        setErrorMsg(d.errors.invalidResponse);
        setState("error");
      }
    };

    xhr.onerror = () => {
      setErrorMsg(d.errors.connectionFailed);
      setState("error");
    };

    xhr.open("POST", "http://localhost:5000/api/video/upload");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const reset = () => {
    setState("idle");
    setProgress(0);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2 px-1">
        <FileVideo className="w-4 h-4 text-[#7C3AED]" />
        <span className="text-sm font-medium text-gray-300">{d.label}</span>
      </div>

      {/* Upload zone — only show when idle or error */}
      {(state === "idle" || state === "error") && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
            isDragging
              ? "border-[#7C3AED] bg-[#7C3AED]/10"
              : "border-white/15 bg-[#1C1132] hover:border-[#7C3AED]/50 hover:bg-[#2D1F47]/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3AED]/20">
            <Upload className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {d.dropText}{" "}
              <span className="text-[#7C3AED] underline underline-offset-2">
                {d.browse}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">{d.supportedFormats}</p>
          </div>
          {state === "error" && errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}
        </div>
      )}

      {/* Uploading / Transcribing */}
      {(state === "uploading" || state === "transcribing") && (
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1C1132] p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
            <div>
              <p className="text-sm font-medium text-white">
                {state === "uploading" ? d.uploading : d.transcribing}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {state === "uploading" ? d.uploadWait : d.transcribeWait}
              </p>
            </div>
          </div>
          {state === "uploading" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{d.uploadProgress}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-[#7C3AED] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {state === "transcribing" && (
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-[#7C3AED] animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {state === "done" && result && (
        <div className="rounded-2xl border border-white/10 bg-[#1C1132] overflow-hidden">
          {/* Video preview */}
          <div className="relative w-full aspect-video bg-black">
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${result.videoUrl}`}
              className="absolute inset-0 w-full h-full object-contain"
              controls={false}
              muted
              autoPlay
              loop
            />
          </div>

          {/* Action panel */}
          <div className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm line-clamp-1">
                {result.title}
              </p>
              {result.transcriptError ? (
                <p className="text-xs text-yellow-400 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {result.transcriptError}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">
                  {result.transcript.length} {d.segments}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="rounded-full border-white/20 text-gray-400 hover:bg-white/5 h-9 px-4"
              >
                {d.reset}
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/practice/local/${result.id}?title=${encodeURIComponent(result.title)}`,
                  )
                }
                className="rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2 h-9 px-5"
              >
                <BookOpen className="w-4 h-4" />
                {d.practice}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
