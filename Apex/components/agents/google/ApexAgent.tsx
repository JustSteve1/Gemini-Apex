// components/agents/google/ApexAgent.tsx
"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import AgentMessage from "./AgentMessage";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ChatMessage, AgentResponse } from "./types";

const STARTERS = [
  "Who set the fastest lap in qualifying?",
  "Compare HAM vs LEC through Turn 3",
  "Which corners cause the most time gain?",
  "Top 5 fastest race laps",
  "What tyres did Verstappen use?",
  "Show me speed differences at Turn 11 apex",
];

export default function ApexAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data: AgentResponse = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.error || data.response,
            timestamp: new Date(),
            metadata: data.metadata as ChatMessage["metadata"],
          },
        ]);
      } catch (err) {
        console.error("[Apex]", err);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Connection error — couldn't reach the agent.",
            timestamp: new Date(),
            metadata: { type: "error" },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F3F7] dark:bg-[#08080D] transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800/60">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <span className="text-sm font-black text-white">A</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>APEX</h1>
            <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              AI RACE ENGINEER
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>LIVE</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-6">
              <span className="text-2xl font-black text-red-500">A</span>
            </div>
            <h2 className="text-lg font-bold mb-1 text-gray-700 dark:text-zinc-300">
              Ask me anything about the race
            </h2>
            <p className="text-sm mb-8 text-center max-w-sm text-gray-500 dark:text-zinc-500">
              I query live telemetry, compare drivers corner-by-corner, and
              analyse what causes lap time gains.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200
                    bg-gray-100/60 border-gray-200 text-gray-600 hover:border-red-600/40 hover:text-gray-900
                    dark:bg-zinc-900/60 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:text-white dark:hover:border-red-600/40 dark:hover:bg-zinc-800/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <AgentMessage key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">A</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce" />
                </div>
                <span className="text-[10px] font-mono ml-1 text-gray-400 dark:text-zinc-600">
                  querying telemetry...
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-zinc-800/60">
        <div className="flex items-end gap-3 rounded-2xl border px-4 py-3 transition-colors
          bg-gray-100/60 border-gray-200 focus-within:border-red-600/40
          dark:bg-zinc-900/60 dark:border-zinc-700/40 dark:focus-within:border-red-600/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about lap times, drivers, corners..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[120px] disabled:opacity-50
              text-gray-800 placeholder-gray-400 dark:text-white dark:placeholder-zinc-600"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 rounded-lg bg-red-600 hover:bg-red-500
              disabled:opacity-30 disabled:cursor-not-allowed
              flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center mt-2 font-mono text-gray-300 dark:text-zinc-700">
          POWERED BY GEMINI 2.5 FLASH • BIGQUERY • GOOGLE CLOUD
        </p>
      </div>
    </div>
  );
}
