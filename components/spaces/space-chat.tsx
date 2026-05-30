"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";
import type { SpaceMessage } from "@/types/app";

type SpaceChatProps = {
  messages: SpaceMessage[];
  loading: boolean;
  sending: boolean;
  onSend: (content: string) => void;
  isMember: boolean;
};

export function SpaceChat({ messages, loading, sending, onSend, isMember }: SpaceChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <span className="grid size-9 place-items-center rounded-xl bg-neon/14 text-neon">
          <MessageCircle className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-white">Live Chat</h3>
          <p className="text-xs text-white/40">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-thin"
        style={{ maxHeight: "420px", minHeight: "280px" }}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-cyan/60" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-white/6">
              <MessageCircle className="size-6 text-white/20" />
            </div>
            <p className="text-sm font-semibold text-white/30">No messages yet</p>
            <p className="mt-1 text-xs text-white/20">Be the first to say something!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start gap-2.5 rounded-2xl px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className="relative size-8 shrink-0 overflow-hidden rounded-xl">
                  {msg.user.profileImage ? (
                    <Image
                      src={msg.user.profileImage}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet/40 to-cyan/40 text-xs font-bold text-white">
                      {msg.user.username.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-white/80">{msg.user.username}</span>
                    <span className="text-[10px] text-white/25">{msg.createdAt}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-5 text-white/60 break-words">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-white/8 px-4 py-3">
        {!isMember ? (
          <p className="text-center text-xs text-white/30">Join this space to chat</p>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              maxLength={500}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-cyan/40 focus:bg-white/[0.07]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan/90 text-ink transition-all hover:bg-cyan disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
