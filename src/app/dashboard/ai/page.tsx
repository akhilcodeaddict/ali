"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send, Sparkles, Bot, User, AlertCircle } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Write a compelling meta description for a wedding photography page",
  "Suggest 5 Instagram captions for a golden-hour wedding shoot",
  "Write a short about section for a photography studio website",
  "Give me keywords for SEO: destination wedding photographer in Hyderabad",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const toast = useToast();
  const setError = (m: string | null) => { if (m) toast.error(m); };
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.get<{ configured: boolean }>("/api/ai/status")
      .then((r) => setConfigured(r.configured))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setInput("");
    setError(null);
    const next: Message = { role: "user", content: message };
    setMessages((m) => [...m, next]);
    setSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post<{ reply: string }>("/api/ai/chat", { message, history });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(msg);
      setMessages((m) => m.slice(0, -1));
      setInput(message);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (configured === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-text-muted">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-heading">AI Assistant</h1>
          <p className="mt-1 text-sm text-text-muted">Powered by NVIDIA Nemotron via OpenRouter</p>
        </div>
        <Card>
          <CardBody>
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                <AlertCircle size={28} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-heading">API key not configured</p>
                <p className="mt-1 text-sm text-text-muted">
                  Add your OpenRouter API key in{" "}
                  <a href="/dashboard/settings" className="text-primary underline underline-offset-2">
                    Settings
                  </a>{" "}
                  to enable the AI assistant.
                </p>
              </div>
              <p className="text-xs text-text-helper">
                Get a free key at{" "}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  openrouter.ai
                </a>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-heading">AI Assistant</h1>
          <p className="mt-1 text-sm text-text-muted">Powered by NVIDIA Nemotron via OpenRouter</p>
        </div>
        {messages.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setMessages([])}>
            New chat
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Chat area */}
        <Card>
          <CardBody className="flex flex-col gap-0 p-0">
            <div className="flex min-h-[420px] flex-col overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles size={30} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-semibold text-heading">What can I help you with?</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Ask me anything about your website content, SEO, captions, or copy.
                    </p>
                  </div>
                  <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        disabled={sending}
                        className="rounded-lg border border-border bg-section px-3 py-2.5 text-left text-[12.5px] text-text-muted transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user" ? "bg-primary text-white" : "bg-section border border-border"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User size={14} strokeWidth={2} />
                        ) : (
                          <Bot size={14} strokeWidth={1.75} className="text-text-muted" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-white"
                            : "bg-section border border-border text-text"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section border border-border">
                        <Bot size={14} strokeWidth={1.75} className="text-text-muted" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-section px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
                  disabled={sending}
                  className="flex-1 resize-none rounded-lg border border-border bg-section px-3 py-2.5 text-[13px] text-text placeholder-text-helper outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:opacity-60"
                />
                <Button onClick={() => send()} disabled={sending || !input.trim()} className="self-end">
                  <Send size={15} strokeWidth={2} />
                  Send
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
