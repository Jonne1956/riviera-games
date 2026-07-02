"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type MusicType = "spotify" | "live" | "break" | "special";
type MusicStatus = "planned" | "playing" | "done";

type MusicProgramItem = {
  id: number;
  title: string;
  subtitle: string | null;
  music_type: MusicType;
  spotify_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  status: MusicStatus;
  notes: string | null;
  is_active: boolean;
  started_at: string | null;
  last_played_at?: string | null;
};

function getTypeIcon(type: MusicType) {
  if (type === "spotify") return "🎵";
  if (type === "live") return "🎤";
  if (type === "break") return "☕";
  return "⭐";
}

function getTypeLabel(type: MusicType) {
  if (type === "spotify") return "Spotify Playlist";
  if (type === "live") return "Live Performance";
  if (type === "break") return "Break";
  return "Special Moment";
}

function getTypeBadgeClass(type: MusicType) {
  if (type === "spotify") return "bg-emerald-400 text-black";
  if (type === "live") return "bg-cyan-400 text-black";
  if (type === "break") return "bg-zinc-300 text-black";
  return "bg-purple-400 text-black";
}

function getStatusLabel(status: MusicStatus) {
  if (status === "playing") return "● Playing";
  if (status === "done") return "✓ Done";
  return "○ Planned";
}

function getStatusClass(status: MusicStatus) {
  if (status === "playing") return "bg-emerald-400 text-black";
  if (status === "done") return "bg-white/10 text-white/45";
  return "bg-black/40 text-white/60";
}

function formatStartedAt(startedAt: string | null) {
  if (!startedAt) return null;

  return new Date(startedAt).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getElapsedMinutes(startedAt: string | null) {
  if (!startedAt) return null;

  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - started);

  return Math.floor(diff / 60000);
}

function getRemainingMinutes(startedAt: string | null, duration: number | null) {
  if (!startedAt || !duration) return null;

  const elapsed = getElapsedMinutes(startedAt);
  if (elapsed === null) return null;

  return Math.max(0, duration - elapsed);
}

function getProgressPercent(startedAt: string | null, duration: number | null) {
  if (!startedAt || !duration) return 0;

  const elapsed = getElapsedMinutes(startedAt);
  if (elapsed === null) return 0;

  return Math.min(100, Math.round((elapsed / duration) * 100));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTimelineTime(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DJConsole() {
  const [items, setItems] = useState<MusicProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightLiveNow, setHighlightLiveNow] = useState(false);
  const liveNowRef = useRef<HTMLElement | null>(null);
  const [, setClockTick] = useState(0);

  useEffect(() => {
    fetchMusicProgram();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockTick((tick) => tick + 1);
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  async function fetchMusicProgram() {
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("music_program")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading music program:", error);
      setErrorMessage("Could not load music program.");
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }


  function focusLiveNow() {
    liveNowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setHighlightLiveNow(true);

    window.setTimeout(() => {
      setHighlightLiveNow(false);
    }, 1200);
  }

  async function setAsPlaying(selectedItem: MusicProgramItem) {
    setUpdatingId(selectedItem.id);
    setErrorMessage(null);

    const now = new Date().toISOString();

    const { error: resetError } = await supabase
      .from("music_program")
      .update({ status: "planned" })
      .eq("status", "playing")
      .select();

    if (resetError) {
      console.error("Error resetting playing status:", resetError);
      setErrorMessage("Could not update music status.");
      setUpdatingId(null);
      return;
    }

    const { error: playError } = await supabase
      .from("music_program")
      .update({
        status: "playing",
        started_at: now,
        last_played_at: now,
      })
      .eq("id", selectedItem.id)
      .select();

    if (playError) {
      console.error("Error setting item as playing:", playError);
      setErrorMessage("Could not set item as playing.");
      setUpdatingId(null);
      return;
    }

    await fetchMusicProgram();
    setUpdatingId(null);
    window.setTimeout(focusLiveNow, 100);
  }

  async function markAsDone(selectedItem: MusicProgramItem) {
    setUpdatingId(selectedItem.id);
    setErrorMessage(null);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("music_program")
      .update({
        status: "done",
        last_played_at: now,
      })
      .eq("id", selectedItem.id)
      .select();

    if (error) {
      console.error("Error marking item as done:", error);
      setErrorMessage("Could not mark item as done.");
      setUpdatingId(null);
      return;
    }

    await fetchMusicProgram();
    setUpdatingId(null);
    window.setTimeout(focusLiveNow, 100);
  }

  function openSpotify(url: string | null) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const nowPlaying = items.find((item) => item.status === "playing");
  const nowPlayingIndex = items.findIndex((item) => item.status === "playing");

  const nextRecommendation =
    nowPlayingIndex >= 0
      ? items.slice(nowPlayingIndex + 1).find((item) => item.status !== "done") ||
        null
      : items.find((item) => item.status === "planned") || null;

  const elapsedMinutes = nowPlaying
    ? getElapsedMinutes(nowPlaying.started_at)
    : null;
  const remainingMinutes = nowPlaying
    ? getRemainingMinutes(nowPlaying.started_at, nowPlaying.duration_minutes)
    : null;
  const progressPercent = nowPlaying
    ? getProgressPercent(nowPlaying.started_at, nowPlaying.duration_minutes)
    : 0;

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "done").length,
    [items]
  );

  const timelineItems = useMemo(() => {
    if (!items.length) return [];

    const anchorIndex = items.findIndex((item) => item.status === "playing");
    const anchorItem = anchorIndex >= 0 ? items[anchorIndex] : null;
    const anchorTime = anchorItem?.started_at
      ? new Date(anchorItem.started_at)
      : null;

    return items.map((item, index) => {
      let estimatedStart: Date | null = null;

      if (anchorTime && anchorIndex >= 0) {
        if (index === anchorIndex) {
          estimatedStart = anchorTime;
        } else if (index > anchorIndex) {
          const minutesAfter = items
            .slice(anchorIndex, index)
            .reduce((total, current) => total + (current.duration_minutes || 0), 0);
          estimatedStart = addMinutes(anchorTime, minutesAfter);
        } else {
          const minutesBefore = items
            .slice(index, anchorIndex)
            .reduce((total, current) => total + (current.duration_minutes || 0), 0);
          estimatedStart = addMinutes(anchorTime, -minutesBefore);
        }
      }

      return {
        ...item,
        estimatedStart,
      };
    });
  }, [items]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#164e63_0%,#09090b_42%,#000000_100%)] text-white px-5 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="text-center border border-cyan-400/40 rounded-3xl px-6 py-5 md:py-6 bg-white/5 shadow-2xl backdrop-blur">
          <p className="text-3xl mb-2">🎧</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            DJ Console
          </h1>
          <p className="text-cyan-200 font-black mt-3 uppercase tracking-[0.28em] text-sm md:text-base">
            Riviera Music Program
          </p>
        </section>

        <section className="rounded-3xl p-4 md:p-5 bg-white/8 border border-white/15 shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200 font-black">
                Evening Timeline
              </p>
              <p className="text-white/45 font-bold mt-1 text-sm">
                Estimated times adjust from the current playing item.
              </p>
            </div>
            <p className="text-white/40 font-black text-xs uppercase tracking-widest">
              {completedCount} / {items.length} completed
            </p>
          </div>

          {loading ? (
            <p className="text-white/50 font-bold">Loading timeline...</p>
          ) : timelineItems.length ? (
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3 min-w-max">
                {timelineItems.map((item) => {
                  const isPlaying = item.status === "playing";
                  const isDone = item.status === "done";

                  return (
                    <div
                      key={item.id}
                      className={`w-56 rounded-2xl border px-4 py-3 transition ${
                        isPlaying
                          ? "bg-emerald-400/15 border-emerald-300 shadow-emerald-900/30"
                          : isDone
                          ? "bg-white/5 border-white/10 opacity-60"
                          : "bg-black/30 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <p className="text-2xl font-black">
                          {formatTimelineTime(item.estimatedStart)}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {isPlaying ? "Now" : isDone ? "Done" : "Next"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-2xl leading-none">
                          {getTypeIcon(item.music_type)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black leading-tight truncate">
                            {item.title}
                          </p>
                          <p className="text-white/45 text-xs font-bold mt-1">
                            {item.duration_minutes ? `${item.duration_minutes} min` : "No duration"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-white/50 font-bold">No timeline items yet.</p>
          )}
        </section>

        <section
          ref={liveNowRef}
          className={`rounded-3xl p-6 md:p-8 bg-black/85 border-2 shadow-2xl transition duration-500 ${
            highlightLiveNow
              ? "border-emerald-300 shadow-emerald-900/60 ring-4 ring-emerald-300/25"
              : "border-cyan-400"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.95)]" />
            <p className="text-sm font-black text-cyan-300 uppercase tracking-widest">
              Live Now
            </p>
          </div>

          {loading ? (
            <p className="text-white/60 font-bold">Loading music program...</p>
          ) : nowPlaying ? (
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-3xl">
                  {getTypeIcon(nowPlaying.music_type)}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getTypeBadgeClass(
                    nowPlaying.music_type
                  )}`}
                >
                  {getTypeLabel(nowPlaying.music_type)}
                </span>
                {formatStartedAt(nowPlaying.started_at) && (
                  <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-white/70">
                    Started {formatStartedAt(nowPlaying.started_at)}
                  </span>
                )}
              </div>

              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                {nowPlaying.title}
              </h2>

              {nowPlaying.subtitle && (
                <p className="text-xl md:text-2xl text-white/75 font-black mt-3 leading-snug">
                  {nowPlaying.subtitle}
                </p>
              )}

              {nowPlaying.notes && (
                <p className="text-white/55 font-bold mt-4 max-w-3xl text-base md:text-lg leading-relaxed">
                  {nowPlaying.notes}
                </p>
              )}

              <div className="mt-6 grid md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-black">
                    Elapsed
                  </p>
                  <p className="text-2xl font-black mt-1">
                    {elapsedMinutes !== null ? `${elapsedMinutes} min` : "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-black">
                    Remaining
                  </p>
                  <p className="text-2xl font-black mt-1">
                    {remainingMinutes !== null ? `${remainingMinutes} min` : "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-black">
                    Program
                  </p>
                  <p className="text-2xl font-black mt-1">
                    {completedCount} / {items.length} done
                  </p>
                </div>
              </div>

              {nowPlaying.duration_minutes && (
                <div className="mt-4">
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest mt-2">
                    {progressPercent}% of planned duration
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white/90 leading-tight tracking-tight">
                No music playing
              </h2>
              <p className="text-white/50 font-bold mt-3 text-lg">
                Select a program item when the console is activated.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-3xl p-5 md:p-6 bg-white/10 border border-cyan-300/30 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.75)]" />
            <p className="text-sm font-black text-cyan-200 uppercase tracking-widest">
              Suggested Next
            </p>
          </div>

          {nextRecommendation ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex gap-4">
                <div className="text-4xl leading-none pt-1">
                  {getTypeIcon(nextRecommendation.music_type)}
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getTypeBadgeClass(
                        nextRecommendation.music_type
                      )}`}
                    >
                      {getTypeLabel(nextRecommendation.music_type)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusClass(
                        nextRecommendation.status
                      )}`}
                    >
                      {getStatusLabel(nextRecommendation.status)}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    {nextRecommendation.title}
                  </h2>
                  {nextRecommendation.subtitle && (
                    <p className="text-white/70 font-black mt-2 text-lg">
                      {nextRecommendation.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {nextRecommendation.duration_minutes && (
                <div className="bg-black/35 rounded-2xl px-5 py-4 text-center border border-white/10 md:min-w-36">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-black">
                    Duration
                  </p>
                  <p className="text-2xl font-black">
                    {nextRecommendation.duration_minutes} min
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/50 font-bold">
              No suggested next item right now.
            </p>
          )}
        </section>

        {errorMessage && (
          <section className="rounded-3xl p-5 bg-red-500/15 border border-red-400 text-red-100 font-black">
            {errorMessage}
          </section>
        )}

        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Tonight&apos;s Music Program
              </h2>
              <p className="text-white/50 font-bold mt-1">
                Recommended order — DJ may choose freely.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {items.map((item) => {
              const isPlaying = item.status === "playing";
              const isDone = item.status === "done";
              const isUpdating = updatingId === item.id;
              const hasSpotifyUrl = Boolean(item.spotify_url);

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl p-5 md:p-6 border shadow-xl transition duration-200 ${
                    isPlaying
                      ? "bg-emerald-400/15 border-emerald-300 shadow-emerald-900/40"
                      : isDone
                      ? "bg-white/5 border-white/10 opacity-55"
                      : "bg-white/10 border-white/15 hover:bg-white/14 hover:border-cyan-300/35 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex gap-4">
                      <div className="text-4xl md:text-5xl leading-none pt-1">
                        {getTypeIcon(item.music_type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getTypeBadgeClass(
                              item.music_type
                            )}`}
                          >
                            {getTypeLabel(item.music_type)}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-white/75 font-black mt-2 text-lg leading-snug">
                            {item.subtitle}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-white/50 font-semibold mt-3 max-w-3xl leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-56">
                      {item.duration_minutes && (
                        <div className="bg-black/35 rounded-2xl px-4 py-3 text-center border border-white/10">
                          <p className="text-xs uppercase tracking-widest text-white/40 font-black">
                            Duration
                          </p>
                          <p className="text-xl font-black">
                            {item.duration_minutes} min
                          </p>
                        </div>
                      )}

                      {isDone ? (
                        <button
                          type="button"
                          disabled
                          className="font-black text-center p-4 rounded-2xl border bg-white/10 text-white/35 border-white/10 cursor-default"
                        >
                          ✓ Completed
                        </button>
                      ) : isPlaying ? (
                        <button
                          type="button"
                          onClick={() => markAsDone(item)}
                          disabled={isUpdating}
                          className="font-black text-center p-4 rounded-2xl border bg-white/10 text-white/80 border-white/20 hover:bg-white/18 hover:text-white transition duration-200"
                        >
                          {isUpdating ? "Updating..." : "✓ Mark as Done"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAsPlaying(item)}
                          disabled={isUpdating}
                          className="font-black text-center p-4 rounded-2xl border transition duration-200 bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300 hover:scale-[1.02] active:scale-[0.99]"
                        >
                          {isUpdating ? "Updating..." : "▶ Set as Playing"}
                        </button>
                      )}

                      {item.music_type === "spotify" && !isDone && (
                        <button
                          type="button"
                          onClick={() => openSpotify(item.spotify_url)}
                          disabled={!hasSpotifyUrl}
                          className={`font-black text-center px-3 py-2 rounded-xl border text-sm transition duration-200 ${
                            hasSpotifyUrl
                              ? "bg-white/10 text-white/70 border-white/15 hover:bg-white/18 hover:text-white hover:border-cyan-300/35"
                              : "bg-white/5 text-white/25 border-white/10 cursor-not-allowed"
                          }`}
                        >
                          Open Spotify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
