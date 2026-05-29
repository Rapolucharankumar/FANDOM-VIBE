"use client";

import { motion } from "framer-motion";
import { Filter, Plus, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Tag } from "@/components/ui/tag";
import type { Post } from "@/types/app";
import { useAuth, useSpaces } from "@/hooks/use-db";

type HomeFeedProps = {
  onCreatePost: () => void;
  posts: Post[];
};

export function HomeFeed({ onCreatePost, posts }: HomeFeedProps) {
  const [activeSpace, setActiveSpace] = useState("all");
  const { user } = useAuth();
  const { spaces } = useSpaces();

  const filteredPosts = activeSpace === "all" ? posts : posts.filter((post) => post.spaceId === activeSpace);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[30px] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">For Your Vibe</p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                People who feel the same weather.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                Your feed is weighted toward shared fandoms, overlapping hobbies, and the mood tags you chose in onboarding.
              </p>
            </div>
            <button
              onClick={onCreatePost}
              className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-5 py-3 text-sm font-extrabold text-white shadow-pink hover:-translate-y-0.5 transition"
            >
              <Plus className="size-4" />
              New Post
            </button>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <Tag tone="cyan" selected={activeSpace === "all"} onClick={() => setActiveSpace("all")}>
              All overlaps
            </Tag>
            {spaces.map((space) => (
              <Tag
                key={space.id}
                tone="frost"
                selected={activeSpace === space.id}
                onClick={() => setActiveSpace(space.id)}
              >
                {space.name}
              </Tag>
            ))}
          </div>
        </motion.div>

        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:h-fit">
        <div className="glass-panel rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-cyan/15 text-cyan shadow-glow">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Vibe Match</p>
              <p className="text-xs text-white/48">92% alignment target</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {user?.vibes?.map((vibe) => (
              <Tag key={vibe} tone="violet">
                {vibe}
              </Tag>
            )) || <p className="text-xs text-white/45 italic">No vibes selected.</p>}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">Live Spaces</h2>
            <Radio className="size-5 text-neon" />
          </div>
          <div className="space-y-3">
            {spaces.slice(0, 4).map((space) => (
              <div key={space.id} className="flex items-center gap-3 rounded-2xl bg-white/6 p-3">
                <div className="relative size-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <Image src={space.coverImage} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white leading-none">{space.name}</p>
                  <p className="text-xs text-white/46 mt-1.5">{space.liveNow} live now</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Filter className="size-4 text-peach" />
            Recommendation recipe
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["45%", "vibes"],
              ["35%", "hobbies"],
              ["20%", "fandom"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/7 p-3">
                <p className="text-lg font-extrabold text-white leading-none">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/38 mt-1.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
