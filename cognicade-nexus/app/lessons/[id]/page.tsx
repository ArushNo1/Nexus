"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/sidebar";
import ChalkEquations from "@/components/ui/chalk-equations";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Film,
  Music,
  Gamepad2,
  Star,
  CheckCircle2,
  Play,
  Trash2,
  ExternalLink,
  Loader2,
  Target,
  ChevronDown,
  ChevronUp,
  XCircle,
  FileText,
  Sparkles,
} from "lucide-react";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = params.id as string;
  const isGenerating = searchParams.get("generating") === "true";

  const [lesson, setLesson] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [showScenes, setShowScenes] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const handleGenerateVideo = async () => {
    if (!lesson || generatingVideo) return;
    setGeneratingVideo(true);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonData: lesson.content,
          lessonId: lesson.id,
          gameDesignDoc: game?.design_doc_data || null,
        }),
      });
      const data = await res.json();
      if (data.videoId) {
        setVideo({ id: data.videoId, status: "processing" });
      }
    } catch (err) {
      console.error("Failed to trigger video generation:", err);
    } finally {
      setGeneratingVideo(false);
    }
  };

  useEffect(() => {
    const loadLesson = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Get user role
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || null);

      // Get lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lessonData) {
        console.error("Failed to load lesson:", lessonError);
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // Get associated video
      const { data: videoData } = await supabase
        .from("videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (videoData) {
        setVideo(videoData);
      }

      // Get associated game
      const { data: gameData } = await supabase
        .from("games")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (gameData) {
        setGame(gameData);
      }

      setLoading(false);
    };

    loadLesson();
  }, [lessonId, router]);

  // Poll for newly created game record (e.g. after redirect from create page)
  useEffect(() => {
    if (loading || !lesson || game) return;

    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data: gameData } = await supabase
        .from("games")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (gameData) setGame(gameData);
    }, 3000);

    const timeout = setTimeout(() => clearInterval(interval), 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [loading, lesson, game, lessonId]);

  // Poll for game status while it's being generated
  useEffect(() => {
    if (!game || game.status === "done" || game.status === "failed") return;

    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("id", game.id)
        .single();

      if (data) {
        setGame(data);
        if (data.status === "done" || data.status === "failed") {
          clearInterval(interval);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [game?.id, game?.status]);

  // Poll for video status while it's being generated
  useEffect(() => {
    if (!video || video.status === "completed" || video.status === "failed")
      return;

    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", video.id)
        .single();

      if (data) {
        setVideo(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [video?.id, video?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap");
          .font-pixel {
            font-family: "Press Start 2P", cursive;
          }
          .font-serif-display {
            font-family: "DM Serif Display", serif;
          }
          .font-sans-clean {
            font-family: "Inter", sans-serif;
          }
        `}</style>
        <ChalkEquations />
        <Sidebar />
        <main
          id="main-content"
          className="min-h-screen transition-[margin] duration-300"
          style={{ marginLeft: "var(--sidebar-width, 16rem)" }}
        >
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3 text-[var(--accent)] font-sans-clean">
              <Loader2 size={24} className="animate-spin" />
              Loading lesson...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap");
          .font-pixel {
            font-family: "Press Start 2P", cursive;
          }
          .font-serif-display {
            font-family: "DM Serif Display", serif;
          }
          .font-sans-clean {
            font-family: "Inter", sans-serif;
          }
        `}</style>
        <ChalkEquations />
        <Sidebar />
        <main
          id="main-content"
          className="min-h-screen transition-[margin] duration-300"
          style={{ marginLeft: "var(--sidebar-width, 16rem)" }}
        >
          <div className="px-8 py-12 text-center">
            <BookOpen className="mx-auto text-[var(--text-muted)] mb-4" size={48} />
            <h2 className="text-2xl font-serif-display text-[var(--text-primary)] mb-2">
              Lesson Not Found
            </h2>
            <p className="text-[var(--text-secondary)] font-sans-clean mb-6">
              This lesson doesn't exist or you don't have access to it.
            </p>
            <Link href="/lessons">
              <button className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--page-bg)] font-bold rounded-lg transition-all shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                Back to Lessons
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      {/* Global Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap");
        .font-pixel {
          font-family: "Press Start 2P", cursive;
        }
        .font-serif-display {
          font-family: "DM Serif Display", serif;
        }
        .font-sans-clean {
          font-family: "Inter", sans-serif;
        }

        @keyframes float-gentle {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
      `}</style>

      <ChalkEquations />
      <Sidebar />

      <main
        id="main-content"
        className="min-h-screen transition-[margin] duration-300"
        style={{ marginLeft: "var(--sidebar-width, 16rem)" }}
      >
        <div className="px-8 py-8">
          {/* Back button */}
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8 font-sans-clean text-sm"
          >
            <ArrowLeft size={16} />
            Back to Lessons
          </Link>

          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-serif-display text-[var(--text-heading)] mb-3">
                  {lesson.title}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {lesson.subject && (
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] text-sm font-sans-clean flex items-center gap-1.5">
                      <BookOpen size={14} />
                      {lesson.subject}
                    </span>
                  )}
                  {lesson.grade_level && (
                    <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-sans-clean flex items-center gap-1.5">
                      <Target size={14} />
                      {lesson.grade_level}
                    </span>
                  )}
                  {lesson.created_at && (
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] text-sm font-sans-clean flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {userRole === "teacher" && (
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "Are you sure you want to delete this lesson? This cannot be undone.",
                      )
                    )
                      return;
                    const supabase = createClient();
                    await supabase.from("lessons").delete().eq("id", lesson.id);
                    router.push("/lessons");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all text-sm font-medium font-sans-clean"
                >
                  <Trash2 size={16} />
                  Delete Lesson
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Video Section */}
            {video && (
              <div className="relative bg-[var(--card-bg)] border border-blue-500/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Film className="text-blue-400" size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                        Concept Video
                      </h2>
                      {video.title && (
                        <p className="text-[var(--text-muted)] text-sm font-sans-clean">
                          {video.title}
                        </p>
                      )}
                    </div>
                    {video.status && (
                      <span
                        className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-pixel ${
                          video.status === "completed"
                            ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                            : video.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {video.status}
                      </span>
                    )}
                  </div>

                  {video.video_url ? (
                    <div className="rounded-xl overflow-hidden border border-[var(--input-border)] bg-black">
                        <source src={video.video_url} type="video/mp4" />
                      </video>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Loader2
                        className="text-yellow-400 animate-spin"
                        size={18}
                      />
                      <p className="text-yellow-400 text-sm font-sans-clean">
                        {video.status === "failed"
                          ? `Video rendering failed${video.error_message ? `: ${video.error_message}` : ""}`
                          : "Video is still processing..."}
                      </p>
                    </div>
                  )}

                  {/* Scenes (collapsible) */}
                  {video.scenes &&
                    Array.isArray(video.scenes) &&
                    video.scenes.length > 0 && (
                      <div className="mt-5">
                        <button
                          onClick={() => setShowScenes(!showScenes)}
                          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-sans-clean"
                        >
                          {showScenes ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                          {video.scenes.length} Scene
                          {video.scenes.length !== 1 ? "s" : ""}
                        </button>
                        {showScenes && (
                          <div className="mt-3 space-y-2">
                            {video.scenes.map((scene: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-4"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Play size={12} className="text-blue-400" />
                                  <span className="text-blue-400 text-xs font-bold font-sans-clean">
                                    Scene {idx + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] font-sans-clean leading-relaxed">
                                  {scene.narration}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Game Section */}
            {game && (
              <div className="relative bg-[var(--card-bg)] border border-emerald-500/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                      <Gamepad2 className="text-[var(--accent)]" size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                        Interactive Game
                      </h2>
                      {game.title && (
                        <p className="text-[var(--text-muted)] text-sm font-sans-clean">
                          {game.title}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-pixel ${
                        game.status === "done"
                          ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                          : game.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {game.status}
                    </span>
                  </div>

                  {game.status === "done" && game.html_src ? (
                    <div className="rounded-xl overflow-hidden border border-[var(--input-border)] bg-black">
                        srcDoc={game.html_src}
                        title={game.title || "Educational Game"}
                        className="w-full border-0"
                        style={{ height: "600px" }}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : game.status === "failed" ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <XCircle
                        className="text-red-400 shrink-0 mt-0.5"
                        size={18}
                      />
                      <div>
                        <p className="text-red-400 text-sm font-sans-clean">
                          Game generation failed.
                        </p>
                        {game.errors && game.errors.length > 0 && (
                          <p className="text-red-400/70 text-xs font-sans-clean mt-1">
                            {game.errors[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Loader2
                        className="text-yellow-400 animate-spin"
                        size={18}
                      />
                      <div>
                        <p className="text-yellow-400 text-sm font-sans-clean">
                          Game is being generated by the AI agent...
                        </p>
                        <p className="text-yellow-400/60 text-xs font-sans-clean mt-1">
                          Status: {game.status} — this page will update
                          automatically
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No video placeholder */}
            {!video && (
              <div className="relative bg-[var(--card-bg)] border border-blue-500/10 rounded-2xl p-8 text-center">
                {generatingVideo ? (
                  <>
                    <Loader2
                      className="mx-auto text-blue-400 mb-3 animate-spin"
                      size={40}
                    />
                    <p className="text-blue-400 font-sans-clean font-medium">
                      Generating concept video...
                    </p>
                    <p className="text-[var(--text-muted)] text-sm font-sans-clean mt-1">
                      This may take a few minutes. The page will update
                      automatically.
                    </p>
                  </>
                ) : game?.status === "done" ? (
                  <>
                    <Film className="mx-auto text-slate-600 mb-3" size={40} />
                    <p className="text-[var(--text-secondary)] font-sans-clean">
                      No concept video generated yet.
                    </p>
                    <p className="text-[var(--text-muted)] text-sm font-sans-clean mt-1">
                      The game is ready — you can now generate a video for this
                      lesson.
                    </p>
                    {userRole === "teacher" && (
                      <button
                        onClick={handleGenerateVideo}
                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all font-sans-clean bg-blue-500 hover:bg-blue-400 text-[#0d281e] shadow-[0_4px_0_#1e40af] hover:translate-y-[2px] hover:shadow-[0_2px_0_#1e40af] active:translate-y-[4px] active:shadow-none"
                      >
                        <Sparkles size={16} /> Generate Concept Video
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Film className="mx-auto text-slate-600 mb-3" size={40} />
                    <p className="text-[var(--text-muted)] font-sans-clean">
                      Video generation is available after the game finishes
                      generating.
                    </p>
                    {game && game.status !== "failed" && (
                      <div className="flex items-center justify-center gap-2 mt-3 text-yellow-400/60 text-xs font-sans-clean">
                        <Loader2 size={12} className="animate-spin" />
                        Waiting for game to complete...
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* No game placeholder */}
            {!game && (
              <div className="relative bg-[var(--card-bg)] border border-[var(--input-border)] rounded-2xl p-8 text-center">
                {isGenerating ? (
                  <>
                    <Loader2
                      className="mx-auto text-[var(--accent)] mb-3 animate-spin"
                      size={40}
                    />
                    <p className="text-[var(--accent)] font-sans-clean font-medium">
                      Generating interactive game...
                    </p>
                    <p className="text-[var(--text-muted)] text-sm font-sans-clean mt-1">
                      This may take a few minutes. The page will update
                      automatically.
                    </p>
                  </>
                ) : (
                  <>
                    <Gamepad2
                      className="mx-auto text-slate-600 mb-3"
                      size={40}
                    />
                    <p className="text-[var(--text-secondary)] font-sans-clean">
                      No game generated for this lesson yet.
                    </p>
                    {userRole === "teacher" && (
                      <Link href={`/create?id=${lesson.id}`}>
                        <button className="mt-4 px-5 py-2.5 bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-bg)] rounded-lg transition-all text-sm font-medium font-sans-clean">
                          Generate Game
                        </button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Lesson Info, Objectives, Design Doc, Key Takeaways — bottom row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Lesson Info Card */}
              <div className="relative bg-[var(--card-bg)] border border-emerald-500/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                      <BookOpen className="text-[var(--accent)]" size={18} />
                    </div>
                    <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                      Lesson Info
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Subject", value: lesson.subject },
                      { label: "Grade Level", value: lesson.grade_level },
                      {
                        label: "Created",
                        value: lesson.created_at
                          ? new Date(lesson.created_at).toLocaleDateString()
                          : null,
                      },
                    ]
                      .filter((item) => item.value)
                      .map((item, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-pixel mb-1">
                            {item.label}
                          </p>
                          <p className="text-[var(--text-primary)] font-medium font-sans-clean text-sm">
                            {item.value}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Objectives Card */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="relative bg-[var(--card-bg)] border border-emerald-500/10 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                        <Target className="text-[var(--accent)]" size={18} />
                      </div>
                      <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                        Objectives
                      </h2>
                    </div>

                    <ul className="space-y-2">
                      {lesson.objectives.map((obj: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] font-sans-clean"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-[var(--accent)] shrink-0 mt-0.5"
                          />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Game Design Document Card */}
              {game?.design_doc_data && (
                <div className="relative bg-[var(--card-bg)] border border-purple-500/10 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <FileText className="text-purple-400" size={18} />
                      </div>
                      <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                        Game Details
                      </h2>
                    </div>

                    <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-4 overflow-auto max-h-[400px]">
                      <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                        {game.design_doc_data}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Key Takeaways */}
              {video?.key_takeaways && video.key_takeaways.length > 0 && (
                <div className="relative bg-[var(--card-bg)] border border-blue-500/10 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Star className="text-blue-400" size={18} />
                      </div>
                      <h2 className="text-xl font-serif-display text-[var(--text-primary)]">
                        Key Takeaways
                      </h2>
                    </div>
                    <ul className="space-y-2">
                      {video.key_takeaways.map((point: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] font-sans-clean"
                        >
                          <Star
                            size={12}
                            className="text-blue-400 shrink-0 mt-1"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
