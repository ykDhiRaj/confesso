'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Trash2, Lock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

function page() {

  const [deleteCode, setDeleteCode]  = useState('')

 const handleClick = async () => {
  try {
    const res = await axios.delete("/api/delete", {
      data: { deletionCode: deleteCode },
    });

    toast.success("Confession deleted successfully", {
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
    setDeleteCode('');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        toast.error("Invalid code", {
          style: {
            background: "#1a1a1a",
            color: "#f5f5f5",
            border: "1px solid #f59e0b",
          },
          iconTheme: {
            primary: "#f59e0b",
            secondary: "#1a1a1a",
          },
        });
      } else {
        toast.error("Provide the code", {
          style: {
            background: "#1a1a1a",
            color: "#f5f5f5",
            border: "1px solid #ef4444",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#1a1a1a",
          },
          duration:500
        });
      }
    } else {
      toast.error("Unexpected error occurred.", {
        style: {
          background: "#1a1a1a",
          color: "#f5f5f5",
          border: "1px solid #f43f5e",
        },
        iconTheme: {
          primary: "#f43f5e",
          secondary: "#1a1a1a",
        },
      });
    }
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

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-lg">
        {/* Header */}
        <div className="text-center mb-16 mt-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-red-900/20 shadow-lg">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-3xl font-light text-zinc-100 tracking-wider">
              Delete Confession
            </h1>
          </div>
          <p className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed">
            Enter your deletion code to permanently remove your confession<br/>
            <span className="text-red-400/60 text-sm">This action cannot be undone.</span>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-8 hover:border-red-900/30 transition-all duration-500">
          
          {/* Warning Section */}
          <div className="flex items-start gap-3 mb-8 p-4 bg-amber-950/20 border border-amber-800/30 rounded-md">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-200 font-light text-sm leading-relaxed">
                <strong>Warning:</strong> Once deleted, your confession cannot be recovered. 
                Make sure you have the correct deletion code before proceeding.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-zinc-400 font-light text-sm tracking-wide">
                <Lock className="w-4 h-4" />
                Deletion Code
              </label>
              <input 
                type="text" 
                placeholder="Enter your deletion code..." 
                value={deleteCode} 
                onChange={(e)=>setDeleteCode(e.target.value)}
                className="w-full p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-md text-zinc-200 placeholder-zinc-500 focus:border-red-900/50 focus:outline-none focus:ring-1 focus:ring-red-900/30 transition-all font-mono tracking-wider"
              />
              <p className="text-zinc-600 text-xs">
                The deletion code was provided when you uploaded your confession.
              </p>
            </div>

            <button 
              onClick={handleClick}
              className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-100 font-light py-4 px-6 rounded-md transition-all duration-300 border border-red-800/30 hover:border-red-700/50 flex items-center justify-center gap-3 tracking-wide group"
            >
              <Trash2 className="w-4 h-4 group-hover:animate-pulse" />
              Delete Confession
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-zinc-800/50">
            <div className="text-center">
              <p className="text-zinc-500 text-sm leading-relaxed">
                Need help? Make sure your deletion code is exactly as provided, 
                including proper capitalization and spacing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-zinc-800/50">
          <p className="text-zinc-600 text-xs tracking-wide">
            Deletion is permanent and immediate.
          </p>
        </div>
      </div>
    </div>
  )
}

export default page