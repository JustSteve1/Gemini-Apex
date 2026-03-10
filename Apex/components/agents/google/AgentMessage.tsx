// components/agents/google/AgentMessage.tsx
"use client";

import { useState } from "react";
import { ChatMessage } from "./types";

export default function AgentMessage({ message }: { message: ChatMessage }) {
  const [showSQL, setShowSQL] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%]`}>
        {/* Apex avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">A</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">APEX</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-red-600 text-white rounded-tr-sm"
              : "bg-zinc-800/80 text-zinc-100 rounded-tl-sm border border-zinc-700/50"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Metadata for data responses */}
        {!isUser && message.metadata?.type === "data" && (
          <div className="flex items-center gap-3 mt-1.5 ml-1">
            {message.metadata.rowCount !== undefined && (
              <span className="text-[10px] text-zinc-600 font-mono">
                {message.metadata.rowCount} rows queried
              </span>
            )}
            {message.metadata.sql && (
              <button
                onClick={() => setShowSQL(!showSQL)}
                className="text-[10px] text-zinc-600 hover:text-red-400 font-mono transition-colors"
              >
                {showSQL ? "hide sql ↑" : "show sql →"}
              </button>
            )}
          </div>
        )}

        {/* SQL panel */}
        {showSQL && message.metadata?.sql && (
          <div className="mt-2 p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 overflow-x-auto">
            <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap">
              {message.metadata.sql}
            </pre>
          </div>
        )}

        {/* Error badge */}
        {!isUser && message.metadata?.type === "error" && (
          <div className="flex items-center gap-1.5 mt-1.5 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-amber-500/80 font-mono">
              query issue — try rephrasing
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 ${isUser ? "text-right" : "text-left"} ml-1`}>
          <span className="text-[10px] text-zinc-700">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
