"use client";

import { useEffect, useState } from "react";
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

export default function DJConsole() {
  const [items, setItems] = useState<MusicProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMusicProgram();
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
  }

  function openSpotify(url: string | null) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const nowPlaying = items.find((item) => item.status === "playing");
  const nextRecommendation = items.find((item) => item.status !== "playing");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#164e63_0%,#09090b_42%,#000000_100%)] text-white px-5 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto space-y-7">
        <section className="text-center border border-cyan-400/40 rounded-3xl px-6 py-6 md:py-7 bg-white/5 shadow-2xl backdrop-blur">
          <p className="text-4xl mb-2">🎧</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            DJ Console
          </h1>
          <p className="text-cyan-200 font-black mt-3 uppercase tracking-[0.28em] text-sm md:text-base">
            Riviera Music Program
          </p>
        </section>

        <section className="rounded-3xl p-7 md:p-10 bg-black/85 border-2 border-cyan-400 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
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
                <span className="text-4xl">
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

              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                {nowPlaying.title}
              </h2>

              {nowPlaying.subtitle && (
                <p className="text-2xl md:text-3xl text-white/75 font-black mt-4 leading-snug">
                  {nowPlaying.subtitle}
                </p>
              )}

              {nowPlaying.notes && (
                <p className="text-white/55 font-bold mt-5 max-w-3xl text-lg leading-relaxed">
                  {nowPlaying.notes}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white/90 leading-tight tracking-tight">
                No music playing
              </h2>
              <p className="text-white/50 font-bold mt-4 text-lg">
                Select a program item when the console is activated.
              </p>
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/8 border border-white/15 p-5 transition hover:bg-white/12 hover:border-cyan-300/35">
            <p className="text-xs uppercase tracking-widest text-white/40 font-black">
              Current Music
            </p>
            <p className="text-2xl font-black mt-2 leading-tight">
              {nowPlaying ? nowPlaying.title : "None"}
            </p>
          </div>

          <div className="rounded-3xl bg-white/8 border border-white/15 p-5 transition hover:bg-white/12 hover:border-cyan-300/35">
            <p className="text-xs uppercase tracking-widest text-white/40 font-black">
              Next Recommendation
            </p>
            <p className="text-2xl font-black mt-2 leading-tight">
              {nextRecommendation ? nextRecommendation.title : "None"}
            </p>
          </div>
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
              const isUpdating = updatingId === item.id;
              const hasSpotifyUrl = Boolean(item.spotify_url);

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl p-5 md:p-6 border shadow-xl transition duration-200 ${
                    isPlaying
                      ? "bg-emerald-400/15 border-emerald-300 shadow-emerald-900/40"
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

                      <button
  type="button"
  onClick={() => {
    
    setAsPlaying(item);
  }}
  disabled={isUpdating || isPlaying}
  className={`font-black text-center p-4 rounded-2xl border transition duration-200 ${
    isPlaying
      ? "bg-emerald-400/20 text-emerald-200 border-emerald-400/40 cursor-default"
      : "bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300 hover:scale-[1.02] active:scale-[0.99]"
  }`}
>
  {isPlaying
    ? "● Playing"
    : isUpdating
    ? "Updating..."
    : "▶ Set as Playing"}
</button>

                      {item.music_type === "spotify" && (
                        <button
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