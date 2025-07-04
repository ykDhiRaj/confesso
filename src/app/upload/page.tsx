"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Mic, MicOff, Upload, Lock, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function Page() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [tags, setTags] = useState("");
  const [deletionCode, setDeletionCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [confessionName, setConfessionName] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleUpload = async () => {
  if (!audioBlob) return alert("No audio to upload.");
  

  // Trim inputs before checking
  const trimmedConfessionName = confessionName.trim();
  const trimmedDescription = description.trim();
  const trimmedTags = tags
    .split(",") // if you want to allow multiple tags
    .map(tag => tag.trim()) // trim each tag
    .filter(tag => tag.length > 0) // remove empty strings
    .join(","); // convert back to comma-separated string

  if (!trimmedConfessionName) {
    return toast.error("At least a title should be provided", {
      style: {
        background: "#1a1a1a",
        color: "#f5f5f5",
        border: "1px solid #b91c1c",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#1a1a1a",
      },
      duration: 600,
    });
  }

  setIsUploading(true);
  const formData = new FormData();
  formData.append("audio", audioBlob, "confession.webm");
  formData.append("tags", trimmedTags);
  formData.append("description", trimmedDescription);
  formData.append("confession_name", trimmedConfessionName);

  try {
    const res = await axios.post("/api/confession", formData);
    setDeletionCode(res.data.deletionCode);
    setAudioBlob(null);
    setAudioURL("");
    setTags("");
    setDescription("");
    setConfessionName("");
    toast.success("Successfully uploaded", {
      style: {
        background: "#1f2937",
        color: "#fff",
        border: "1px solid #10b981",
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#1f2937",
      },
    });
  } catch (err) {
    toast.error("Error uploading", {
      style: {
        background: "#1a1a1a",
        color: "#f5f5f5",
        border: "1px solid #b91c1c",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#1a1a1a",
      },
    });
  } finally {
    setIsUploading(false);
  }
};


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

    <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-16 mt-10 px-2">
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-red-900/20 shadow-lg">
            <Mic className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-wider text-center">
            Share Your Confession
          </h1>
        </div>
        <p className="text-zinc-500 text-sm sm:text-base max-w-md sm:max-w-xl mx-auto leading-relaxed">
          Your voice matters. Record your truth anonymously and let it find its place
          <br />
          <span className="text-red-400/60 text-xs sm:text-sm">
            in the digital sanctuary of secrets.
          </span>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4 sm:p-8 hover:border-red-900/30 transition-all duration-500">
        {/* Recording Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 border ${
                recording
                  ? "bg-red-900/30 hover:bg-red-900/50 border-red-800/30 hover:border-red-700/50 animate-pulse"
                  : "bg-zinc-800/50 hover:bg-zinc-700/50 border-zinc-700/50 hover:border-red-900/30"
              }`}
            >
              {recording ? (
                <MicOff className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
              ) : (
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-400 hover:text-red-400 transition-colors" />
              )}
              {recording && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
              )}
            </button>
          </div>
          <p className="text-zinc-300 mt-4 text-base sm:text-lg font-light tracking-wide">
            {recording ? "Recording... Click to stop" : "Click to start recording"}
          </p>
          {recording && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-mono">REC</span>
            </div>
          )}
        </div>

        {/* Audio Preview */}
        {audioURL && (
          <div className="mb-8 p-4 sm:p-6 bg-black/30 rounded-md border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-500/60 rounded-full"></div>
              <span className="text-zinc-300 font-light">Recording Complete</span>
            </div>
            <div className="bg-zinc-800/30 rounded p-3">
              <audio
                controls
                src={audioURL}
                className="w-full"
                style={{
                  filter: "invert(1) hue-rotate(180deg)",
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-zinc-400 font-light text-sm tracking-wide">Confession Title</label>
            <input
              type="text"
              placeholder="Give your confession a name..."
              value={confessionName}
              onChange={(e) => setConfessionName(e.target.value)}
              className="w-full p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-md text-zinc-200 placeholder-zinc-500 focus:border-red-900/50 focus:outline-none focus:ring-1 focus:ring-red-900/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-400 font-light text-sm tracking-wide">Description</label>
            <textarea
              placeholder="Share the story behind your confession..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-md text-zinc-200 placeholder-zinc-500 focus:border-red-900/50 focus:outline-none focus:ring-1 focus:ring-red-900/30 transition-all resize-none h-28 sm:h-32"
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-400 font-light text-sm tracking-wide">Tags</label>
            <input
              type="text"
              placeholder="Add tags (comma-separated)..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-md text-zinc-200 placeholder-zinc-500 focus:border-red-900/50 focus:outline-none focus:ring-1 focus:ring-red-900/30 transition-all"
            />
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full mt-8 bg-red-900/30 hover:bg-red-900/50 text-red-100 font-light py-4 px-6 rounded-md transition-all duration-300 border border-red-800/30 hover:border-red-700/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 tracking-wide"
          disabled={isUploading || !audioBlob}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border border-red-400/30 border-t-red-400"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Confession</span>
            </>
          )}
        </button>

        {/* Deletion Code */}
        {deletionCode && (
          <div className="mt-8 p-6 bg-amber-950/20 border border-amber-800/30 rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-light tracking-wide">Save Your Deletion Code</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(deletionCode);
                  toast.success("Code copied!", {
                    style: {
                      background: "#1a1a1a",
                      color: "#f5f5f5",
                      border: "1px solid #10b981",
                    },
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#1a1a1a",
                    },
                    duration:600
                  });
                }}
                className="text-amber-300 hover:text-amber-400 text-sm underline transition-all cursor-pointer"
              >
                <Copy />
              </button>
            </div>

            <div className="bg-black/40 p-4 rounded border border-zinc-800/50 overflow-x-auto">
              <code className="text-amber-300 font-mono text-lg tracking-wider">{deletionCode}</code>
            </div>

            <p className="text-amber-200/70 text-sm mt-3 italic">
              Keep this code safe — it's your only way to remove this confession.
              Otherwise, a digital footprint will be left behind.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 py-6 border-t border-zinc-800/50">
        <p className="text-zinc-600 text-xs tracking-wide">
          Your voice, your choice. Anonymous and secure.
        </p>
      </div>
    </div>
  </div>
);

}
