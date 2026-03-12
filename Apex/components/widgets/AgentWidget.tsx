// components/widgets/AgentWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { WidgetConfig } from "./types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentWidget({ config }: { config: WidgetConfig }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask me anything about the race." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        { role: "assistant", content: data.response || data.error || "No response." },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Status */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "var(--text-muted)" }} />
        <span className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>LIVE</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[90%] px-2.5 py-1.5"
              style={
                m.role === "user"
                  ? { background: "var(--glass-bg-hover)", color: "var(--text-primary)" }
                  : { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }
              }
            >
              <p className="text-[11px] font-mono leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 py-1">
            {[0, 0.15, 0.3].map((delay, i) => (
              <div
                key={i}
                className="w-1 h-1 animate-pulse"
                style={{ background: "var(--text-subtle)", animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 mt-2 px-2 py-1.5"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={config.params.placeholder || "Ask..."}
          disabled={loading}
          className="flex-1 bg-transparent text-[11px] font-mono outline-none disabled:opacity-40"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="text-[10px] font-mono transition-colors disabled:opacity-20"
          style={{ color: "var(--text-muted)" }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
