"use client";

import { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageCircle,
  Clock,
  Mic,
} from "lucide-react";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();

  // Convert both to local "date only" strings
  const dateDay = date.toDateString();
  const nowDay = now.toDateString();

  if (dateDay === nowDay) return "Today";

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDay = yesterday.toDateString();

  if (dateDay === yesterdayDay) return "Yesterday";

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type Confession = {
  id: string;
  audio_url: string;
  tags: string[];
  description?: string;
  confession_name?: string;
  play_count?: number;
  created_at?: string;
};

function Page() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({});
  const [duration, setDuration] = useState<{ [key: string]: number }>({});
  const [volume, setVolume] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [hasmounted, setHasMounted] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const fetchConfessions = async (page: number, isInitialLoad = false) => {
  try {
    const res = await fetch(`/api/confession?page=${page}&limit=10`);
    const data = await res.json();

    if (data.confessions.length < 10) {
      setHasMore(false);
    }

    // If it's the initial load (page 1) or first load after navigation, replace the array
    // Otherwise, append to existing confessions
    if (isInitialLoad || page === 1) {
      setConfessions(data.confessions);
    } else {
      setConfessions((prev) => [...prev, ...data.confessions]);
    }

    // Initialize audio states for new confessions
    const newTime: { [key: string]: number } = {};
    const newDuration: { [key: string]: number } = {};
    const newVolume: { [key: string]: number } = {};

    data.confessions.forEach((confession: Confession) => {
      newTime[confession.id] = 0;
      newDuration[confession.id] = 0;
      newVolume[confession.id] = 0.8;
    });

    if (isInitialLoad || page === 1) {
      // Reset audio states for initial load
      setCurrentTime(newTime);
      setDuration(newDuration);
      setVolume(newVolume);
    } else {
      // Merge with existing audio states
      setCurrentTime((prev) => ({ ...prev, ...newTime }));
      setDuration((prev) => ({ ...prev, ...newDuration }));
      setVolume((prev) => ({ ...prev, ...newVolume }));
    }
  } catch (error) {
    console.error("Failed to fetch confessions", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (page > 1) {
    fetchConfessions(page, false);
  }
}, [page]);

useEffect(() => {
  return () => {
    // Reset state when component unmounts
    setConfessions([]);
    setPage(1);
    setHasMore(true);
    setPlayingId(null);
    setCurrentTime({});
    setDuration({});
    setVolume({});
  };
}, []);

// Modified useEffect for initial load
useEffect(() => {
  if (hasmounted) {
    // Reset state and fetch first page
    setConfessions([]);
    setPage(1);
    setHasMore(true);
    setPlayingId(null);
    setCurrentTime({});
    setDuration({});
    setVolume({});
    fetchConfessions(1, true); // Mark as initial load
  }
}, [hasmounted]);

  const handlePlay = async (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    // Pause all other audios
    Object.entries(audioRefs.current).forEach(([key, audioEl]) => {
      if (key !== id && !audioEl.paused) {
        audioEl.pause();
      }
    });

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.play();
      setPlayingId(id);

      // Increment play count
      const res = await fetch("/api/increment-play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      console.log(res)
    }
  };

  const handleTimeUpdate = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      setCurrentTime((prev) => ({ ...prev, [id]: audio.currentTime }));
    }
  };

  const handleLoadedMetadata = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      setDuration((prev) => ({ ...prev, [id]: audio.duration }));
    }
  };

  const handleSeek = (id: string, value: number) => {
    const audio = audioRefs.current[id];
    if (audio) {
      audio.currentTime = value;
      setCurrentTime((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleVolumeChange = (id: string, value: number) => {
    const audio = audioRefs.current[id];
    if (audio) {
      audio.volume = value;
      setVolume((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleAudioEnd = (id: string) => {
    setPlayingId(null);
    setCurrentTime((prev) => ({ ...prev, [id]: 0 }));
  };

  if (loading || !hasmounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-red-900/30 border-t-red-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Subtle background texture */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 via-transparent to-zinc-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,69,19,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-red-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-amber-500/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-red-500/20 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-500/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 mt-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-red-900/20 shadow-lg">
              <Mic className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-3xl font-light text-zinc-100 tracking-wider">
              Anonymous Confessions
            </h1>
          </div>
          <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
            Whispered truths in the digital darkness. Every voice deserves to be
            heard,
            <br />
            <span className="text-red-400/60 text-sm">
              every secret finds its sanctuary here.
            </span>
          </p>
        </div>

        {/* Confessions List */}
        {confessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-900/20">
              <MessageCircle className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-300 text-lg mb-2">Silence fills the void</p>
            <p className="text-zinc-600 text-sm">Be the first to break it</p>
          </div>
        ) : (
          <div className="space-y-8">
            {confessions.map((confession, index) => (
              <div
                key={confession.id}
                className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-8 hover:border-red-900/30 transition-all duration-500 hover:bg-zinc-900/60"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-950/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Confession Header */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-red-500/40 rounded-full"></div>
                      <h3 className="text-lg font-normal text-zinc-100 group-hover:text-zinc-50 transition-colors">
                        {confession.confession_name || "Untitled"}
                      </h3>
                    </div>
                    {confession.description && (
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4 pl-5 border-l border-zinc-800 italic">
                        {confession.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 text-xs ml-6">
                    <Clock className="w-3 h-3" />
                    {confession.created_at && formatDate(confession.created_at)}
                  </div>
                </div>

                {/* Custom Audio Player */}
                <div className="bg-black/30 rounded-md p-6 mb-6 border border-zinc-800/50 relative z-10">
                  {/* Hidden audio element */}
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[confession.id] = el;
                    }}
                    onTimeUpdate={() => handleTimeUpdate(confession.id)}
                    onLoadedMetadata={() => handleLoadedMetadata(confession.id)}
                    onEnded={() => handleAudioEnd(confession.id)}
                    preload="metadata"
                  >
                    <source
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${confession.audio_url}`}
                      type="audio/webm"
                    />
                  </audio>

                  {/* Custom Player UI */}
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => handlePlay(confession.id)}
                      className="w-10 h-10 bg-red-900/30 hover:bg-red-900/50 rounded-full flex items-center justify-center border border-red-800/30 hover:border-red-700/50 transition-all group"
                    >
                      {playingId === confession.id ? (
                        <Pause className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                      ) : (
                        <Play className="w-4 h-4 text-red-400 group-hover:text-red-300 ml-0.5" />
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-zinc-500 text-xs font-mono min-w-[35px]">
                        {formatTime(currentTime[confession.id] || 0)}
                      </span>

                      <div className="flex-1 relative">
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
                            style={{
                              width: duration[confession.id]
                                ? `${
                                    (currentTime[confession.id] /
                                      duration[confession.id]) *
                                    100
                                  }%`
                                : "0%",
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={duration[confession.id] || 0}
                          value={currentTime[confession.id] || 0}
                          onChange={(e) =>
                            handleSeek(
                              confession.id,
                              parseFloat(e.target.value)
                            )
                          }
                          className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleVolumeChange(
                            confession.id,
                            volume[confession.id] > 0 ? 0 : 0.8
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        {(volume[confession.id] || 0) > 0 ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-16 relative">
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500 transition-all duration-150"
                            style={{
                              width: `${(volume[confession.id] || 0.8) * 100}%`,
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume[confession.id] || 0.8}
                          onChange={(e) =>
                            handleVolumeChange(
                              confession.id,
                              parseFloat(e.target.value)
                            )
                          }
                          className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {confession.tags.filter((tag) => tag.trim().length > 0).length >
                  0 && (
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {confession.tags
                      .filter((tag) => tag.trim().length > 0)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-zinc-800/50 text-zinc-500 text-xs rounded border border-zinc-700/50 hover:border-zinc-600/50 hover:text-zinc-400 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}

                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-6 py-2 text-sm font-medium text-red-400 border border-red-900/40 rounded hover:bg-red-900/20 transition"
            >
              Load More
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 py-8 border-t border-zinc-800/50">
          <p className="text-zinc-600 text-xs tracking-wide">
            Your voice, your choice. Anonymous and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
