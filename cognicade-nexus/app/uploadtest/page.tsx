"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type FileKind = "code" | "video" | "audio";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileKind>("code");
  const [materialId, setMaterialId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseDebug, setResponseDebug] = useState<string | null>(null);

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please choose a file to upload.");
      return;
    }
    console.log("THE FILE TO UPLOAD IS: ", file);
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !supabase) {
      setStatus(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    console.log("Supabase client initialized: ", supabase);
    setLoading(true);
    setStatus(null);
    setResponseDebug(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", fileType);
      console.log("fileType: ", fileType);
      console.log("file: ", file);
      if (materialId.trim()) {
        formData.append("material_id", materialId.trim());
      }
      console.log("FormData prepared: ", formData);
      const { data, error } = await supabase.functions.invoke(
        "upload-generated-files",
        {
          body: formData,
        }
      );

      setResponseDebug(
        JSON.stringify({ data, error }, null, 2) || null
      );

      if (error) {
        setStatus(
          `Error ${error.status ?? ""}: ${error.message || "Upload failed"}`
        );
      } else {
        setStatus(
          `Uploaded to ${data?.bucket}/${data?.file_path} (material_id: ${data?.material_id})`
        );
        if (data?.material_id) setMaterialId(data.material_id);
      }
    } catch (err: any) {
      setStatus(err.message || "Unexpected error");
      setResponseDebug(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Upload Test</h1>
          <p className="text-muted-foreground">
            Upload a code, video, or audio file via the edge function.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border p-6 shadow-sm"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Type</label>
            <div className="flex gap-4">
              {(["code", "video", "audio"] as const).map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="fileType"
                    value={type}
                    checked={fileType === type}
                    onChange={() => setFileType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Material ID (optional)
            </label>
            <input
              type="text"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              placeholder="uuid"
              className="w-full rounded border px-3 py-2"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to create a new material entry. If provided, the file
              will be stored as [material_id].[ext].
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {status && (
          <div className="rounded border border-muted-foreground/30 bg-muted p-4 text-sm space-y-3">
            <div>{status}</div>
            {responseDebug && (
              <pre className="whitespace-pre-wrap break-all text-xs bg-background p-3 rounded border">
                {responseDebug}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}