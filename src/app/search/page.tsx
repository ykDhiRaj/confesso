"use client";
import React, { useState, useRef } from "react";
import {
  Search as SearchIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

type Confession = {
  id: string;
  audio_url: string;
  tags: string[];
  description?: string;
  confession_name?: string;
  play_count?: number;
  created_at?: string;
};

function SearchPage() {
  const [name, setName] = useState("");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [sourceType, setSourceType] = useState<"popular" | "search" | null>(
    null
  );

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({});
  const [duration, setDuration] = useState<{ [key: string]: number }>({});
  const [volume, setVolume] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSearchClick = async () => {
    if(name == "") return toast('Write something',{
      duration:600
    })
    try {
      const res = await axios.get(`/api/search/${name}`);
      setConfessions(res.data.results || []);
      setSourceType("search");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePopularClick = async () => {
    try {
      const res = await axios.get("/api/popular");
      setConfessions(res.data.popular_confessions || []);
      setSourceType("popular");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlay = async (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

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

      await fetch("/api/increment-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
  };

  const handleVolumeChange = (id: string, value: number) => {
    const audio = audioRefs.current[id];
    if (audio) {
      audio.volume = value;
      setVolume((prev) => ({ ...prev, [id]: value }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-2 max-w-3xl mx-auto mt-10 w-full">
  <button
    onClick={handlePopularClick}
    className="text-black bg-white px-4 py-2 rounded-full hover:bg-[#923C3E] transition w-full sm:w-auto"
  >
    See today's popular
  </button>

  <div className="relative flex-1 w-full">
    <input
      onChange={(e) => setName(e.target.value)}
      value={name}
      className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-full py-3 px-6 text-center w-full text-lg"
      type="text"
      placeholder="Enter the name of the confession..."
    />
    <SearchIcon
      color="white"
      size={28}
      onClick={handleSearchClick}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-red-400 transition"
    />
  </div>
</div>


      <div className="mt-12 max-w-3xl mx-auto space-y-6">
        {sourceType && confessions.length === 0 && (
          <p className="text-zinc-400 text-center">No confessions found.</p>
        )}

        {confessions.map((confession) => (
          <div
            key={confession.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {confession.confession_name || "Untitled"}
                </h2>
                {confession.description && (
                  <p className="text-zinc-400 text-sm mt-1">
                    {confession.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                <Clock size={14} className="inline-block mr-1" />
                {confession.created_at && formatDate(confession.created_at)}
              </span>
            </div>

            {/* Audio Player UI */}
            <div className="bg-black/30 rounded-md p-6 border border-zinc-800/50 relative z-10">
              <audio
                ref={(el) => {
                  if (el) {
                    audioRefs.current[confession.id] = el;

                    // Set default volume if not already set
                    if (volume[confession.id] === undefined) {
                      el.volume = 0.8;
                      setVolume((prev) => ({ ...prev, [confession.id]: 0.8 }));
                    }
                  }
                }}
                onTimeUpdate={() =>
                  setCurrentTime((prev) => ({
                    ...prev,
                    [confession.id]:
                      audioRefs.current[confession.id]?.currentTime || 0,
                  }))
                }
                onLoadedMetadata={() =>
                  setDuration((prev) => ({
                    ...prev,
                    [confession.id]:
                      audioRefs.current[confession.id]?.duration || 0,
                  }))
                }
                onEnded={() => {
                  setPlayingId(null);
                }}
                preload="metadata"
              >
                <source
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${confession.audio_url}`}
                  type="audio/webm"
                />
              </audio>

              <div className="flex items-center gap-4">
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
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        audioRefs.current[confession.id].currentTime = newTime;
                        setCurrentTime((prev) => ({
                          ...prev,
                          [confession.id]: newTime,
                        }));
                      }}
                      className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

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
            <div className="flex flex-wrap gap-2 mt-2">
              {confession.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
