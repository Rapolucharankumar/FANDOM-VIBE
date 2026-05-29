"use client";

import { useState } from "react";
import { Heart, MessageCircle, Sparkles, UserCheck, BellRing, Check, Loader2, Compass } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { SectionHeading } from "@/components/ui/section-heading";
import { useFeed, useSignals } from "@/hooks/use-db";
import Link from "next/link";

const signalIconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  like: {
    icon: Heart,
    tone: "text-neon bg-neon/12 border-neon/20"
  },
  comment: {
    icon: MessageCircle,
    tone: "text-cyan bg-cyan/12 border-cyan/20"
  },
  follow: {
    icon: UserCheck,
    tone: "text-peach bg-peach/12 border-peach/20"
  },
  new_post_match: {
    icon: Sparkles,
    tone: "text-lavender bg-violet/12 border-violet/20"
  },
  vibe_match_join: {
    icon: Compass,
    tone: "text-cyan bg-cyan/12 border-cyan/20"
  }
};

export default function NotificationsPage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { addPost } = useFeed();
  const { signals, loading, markAsRead } = useSignals();

  return (
    <AppShell onCreatePost={() => setCreatePostOpen(true)}>
      <div className="mx-auto max-w-4xl space-y-7">
        <SectionHeading
          eyebrow="Signals Hub"
          title="Frequencies from your city."
          copy="Real-time overlaps, comments, follows, and resonance signals from users matching your style."
        />

        <section className="glass-panel rounded-[30px] p-4 sm:p-5">
          {/* Summary status header */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/7 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-cyan/12 text-cyan shadow-cyan">
                <BellRing className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Atmospheric Status</p>
                <p className="text-xs text-white/50">
                  {loading ? "Scanning bands..." : `${signals.filter(s => !s.isRead).length} new signals waiting.`}
                </p>
              </div>
            </div>
          </div>

          {/* List of alerts */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-cyan" />
              </div>
            ) : signals.length > 0 ? (
              signals.map((item) => {
                const config = signalIconMap[item.type] || {
                  icon: BellRing,
                  tone: "text-white bg-white/12 border-white/20"
                };
                const Icon = config.icon;
                
                return (
                  <article
                    key={item.id}
                    className={`flex items-start gap-4 rounded-3xl border p-4 transition ${
                      item.isRead
                        ? "border-white/5 bg-white/3 opacity-74"
                        : "border-white/12 bg-white/8 hover:bg-white/10"
                    }`}
                  >
                    {/* Icon wrapper */}
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl border ${config.tone}`}>
                      <Icon className="size-5" />
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <Link
                          href={item.link || "/home"}
                          onClick={() => markAsRead(item.id)}
                          className="text-sm font-bold leading-6 text-white hover:text-cyan transition"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[10px] text-white/36">{item.createdAt}</span>
                      </div>
                      
                      {item.body && (
                        <p className="mt-1 text-xs text-white/60 line-clamp-1">{item.body}</p>
                      )}

                      {/* Display Sender Avatar if present */}
                      {item.sender && (
                        <div className="mt-3 flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.sender.profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"}
                            alt=""
                            className="size-5 rounded-full object-cover border border-white/10"
                          />
                          <span className="text-[11px] font-semibold text-white/46">@{item.sender.handle}</span>
                        </div>
                      )}
                    </div>

                    {/* Mark as read button */}
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="focus-ring grid size-8 place-items-center rounded-xl bg-white/10 hover:bg-cyan/15 text-white/60 hover:text-cyan border border-white/5 transition shrink-0"
                        title="Mark read"
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="glass-panel rounded-[24px] py-16 text-center text-white/38">
                The sky is quiet. No signals recorded.
              </div>
            )}
          </div>
        </section>
      </div>

      <CreatePostModal open={createPostOpen} onClose={() => setCreatePostOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
