"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Gamepad2,
  Film,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LessonUploaderProps {
  classroomId: string;
}

export function LessonUploader({ classroomId }: LessonUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Parse the lesson file
      const parseResponse = await fetch("/api/parse-lesson", {
        method: "POST",
        body: formData,
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to parse lesson",
        );
      }

      const parsedData = await parseResponse.json();

      // 2. Save lesson to Supabase
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !parsedData.data?.lessonPlan) {
        throw new Error("Could not save lesson. Please try again.");
      }

      const lp = parsedData.data.lessonPlan;
      const { data: lessonRow, error: lessonError } = await supabase
        .from("lessons")
        .insert({
          user_id: user.id,
          title: lp.title || file.name.replace(/\.[^.]+$/, ""),
          subject: lp.subject || null,
          grade_level: lp.gradeLevel || null,
          objectives: lp.objectives || [],
          content: parsedData.data,
        })
        .select("id")
        .single();

      if (lessonError || !lessonRow) {
        throw new Error("Failed to save lesson to database.");
      }

      const lessonId = lessonRow.id;

      // 3. Create lesson assignment for the classroom
      await supabase.from("lesson_assignments").insert({
        lesson_id: lessonId,
        classroom_id: classroomId,
        assigned_by: user.id,
        is_published: true,
      });

      // 4. Fire off game generation (video can be triggered later from the lesson page)
      fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_plan: parsedData.data,
          lesson_id: lessonId,
          title: lp.title || file.name.replace(/\.[^.]+$/, ""),
          target_audience: lp.gradeLevel || null,
        }),
      }).catch((err) => console.error("Game generation request failed:", err));

      // 4.5. Fire off thumbnail generation (fire-and-forget)
      fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          title: lp.title || file.name.replace(/\.[^.]+$/, ""),
          subject: lp.subject || null,
        }),
      }).catch((err) => console.error("Thumbnail generation failed:", err));

      // 5. Redirect to lesson detail page immediately
      router.push(`/lessons/${lessonId}?generating=true`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during processing.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* ── Upload Card ── */}
      <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-serif-display text-white">
                Create Educational Game
              </h2>
              <p className="text-slate-400 text-sm font-sans-clean mt-0.5">
                Upload a lesson plan to generate an interactive game. You can
                generate a concept video later from the lesson page.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-emerald-400 bg-emerald-500/10"
                  : file
                    ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                    : "border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.json,.pptx,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <FileText className="text-emerald-400" size={28} />
                  </div>
                  <div>
                    <p className="text-white font-medium font-sans-clean">
                      {file.name}
                    </p>
                    <p className="text-slate-500 text-xs font-sans-clean mt-1">
                      {(file.size / 1024).toFixed(1)} KB — Click or drop to
                      replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <Upload className="text-slate-400" size={28} />
                  </div>
                  <div>
                    <p className="text-white font-medium font-sans-clean">
                      Drop your lesson plan here
                    </p>
                    <p className="text-slate-500 text-sm font-sans-clean mt-1">
                      or click to browse
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {["PDF", "TXT", "MD", "JSON", "PPTX", "DOCX"].map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 text-[10px] font-pixel"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Asset toggles */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300 font-sans-clean">
                Assets to Generate
              </p>
              <div className="flex flex-wrap gap-3">
                {/* Game — always on */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Gamepad2 size={16} />
                  <span className="text-sm font-medium font-sans-clean">
                    Interactive Game
                  </span>
                </div>

                {/* Video — generated later */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500">
                  <Film size={16} />
                  <span className="text-sm font-medium font-sans-clean">
                    Concept Video
                  </span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!file || loading}
              className={`group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-all font-sans-clean ${
                !file || loading
                  ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Game
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-red-400 shrink-0 mt-0.5 text-lg">✕</span>
                <p className="text-red-400 text-sm font-sans-clean">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
