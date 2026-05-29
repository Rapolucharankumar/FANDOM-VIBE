"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { PostCard } from "@/components/feed/post-card";
import { SpaceCard } from "@/components/spaces/space-card";
import { Tag } from "@/components/ui/tag";
import { useFeed, useSearch } from "@/hooks/use-db";
import { Search as SearchIcon, Users, Radio, Tag as TagIcon, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type SearchFilter = "all" | "users" | "spaces" | "tags" | "posts";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { addPost } = useFeed();
  const { results, loading } = useSearch(query);

  const hasResults =
    results.users.length > 0 ||
    results.spaces.length > 0 ||
    results.tags.length > 0 ||
    results.posts.length > 0;

  return (
    <AppShell onCreatePost={() => setCreatePostOpen(true)}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Search header */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">Aesthetic Engine</p>
          <h1 className="font-display text-4xl font-bold leading-none text-white sm:text-5xl">Search the City</h1>
          <p className="text-sm text-white/55">Discover users, spaces, and vibes vibrating at your wavelength.</p>
        </div>

        {/* Input Bar */}
        <div className="glass-panel flex items-center gap-3 rounded-[24px] p-3 border border-white/10 bg-white/5 focus-within:border-cyan/40 transition">
          <SearchIcon className="size-5 text-white/42 ml-2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search username, handle, spaces, or vibe tags (e.g. BTS, Midnight)..."
            className="flex-1 bg-transparent text-white placeholder:text-white/34 outline-none border-none text-base"
          />
          {loading && <Loader2 className="size-5 animate-spin text-cyan mr-2" />}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Overlaps", icon: Sparkles },
            { id: "users", label: "Users", icon: Users },
            { id: "spaces", label: "Spaces", icon: Radio },
            { id: "tags", label: "Interests & Tags", icon: TagIcon }
          ].map(f => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as SearchFilter)}
                className={`focus-ring flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition shrink-0 ${
                  active
                    ? "border-cyan bg-cyan/15 text-cyan-100 shadow-cyan"
                    : "border-white/10 bg-white/7 text-white/68 hover:border-white/20 hover:bg-white/12"
                }`}
              >
                <Icon className="size-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search Results Display */}
        <div className="space-y-8">
          {query.trim() === "" ? (
            <div className="glass-panel rounded-[30px] p-10 text-center text-white/45">
              Enter a signal query above to scan the environment.
            </div>
          ) : !hasResults && !loading ? (
            <div className="glass-panel rounded-[30px] p-10 text-center text-white/45">
              No overlapping vectors found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Users Results */}
              {(filter === "all" || filter === "users") && results.users.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Users className="size-4 text-cyan" />
                    Users ({results.users.length})
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => (
                      <Link
                        key={u.id}
                        href={`/profile/${u.id}`}
                        className="glass-panel rounded-3xl p-4 flex gap-4 hover:border-white/20 transition hover:-translate-y-0.5 border border-white/10"
                      >
                        <div className="relative size-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                          <Image
                            src={u.profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"}
                            alt={u.username}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white leading-none">{u.username}</p>
                          <p className="text-xs text-white/40 mt-1">@{u.handle}</p>
                          <p className="text-xs text-white/60 line-clamp-2 mt-2 leading-5">{u.bio}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Spaces Results */}
              {(filter === "all" || filter === "spaces") && results.spaces.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Radio className="size-4 text-neon" />
                    Spaces ({results.spaces.length})
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {results.spaces.map(space => (
                      <SpaceCard key={space.id} space={space} />
                    ))}
                  </div>
                </section>
              )}

              {/* Tags & Interests Results */}
              {(filter === "all" || filter === "tags") && results.tags.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <TagIcon className="size-4 text-peach" />
                    Overlapping Interest Tags ({results.tags.length})
                  </h2>
                  <div className="glass-panel rounded-3xl p-5 flex flex-wrap gap-2.5">
                    {results.tags.map(tag => (
                      <Tag key={tag} tone="frost">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                </section>
              )}

              {/* Posts matches */}
              {(filter === "all" || filter === "posts") && results.posts.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-violet" />
                    Matched Posts ({results.posts.length})
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {results.posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <CreatePostModal open={createPostOpen} onClose={() => setCreatePostOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
