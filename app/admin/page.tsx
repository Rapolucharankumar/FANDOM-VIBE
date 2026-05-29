"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { useFeed, useAdminAnalytics } from "@/hooks/use-db";
import { Loader2, Users, FileText, Activity, TrendingUp, Star, Heart } from "lucide-react";

export default function AdminPage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { addPost } = useFeed();
  const { stats, loading, refreshStats } = useAdminAnalytics();

  return (
    <AppShell onCreatePost={() => setCreatePostOpen(true)}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neon">Superuser terminal</p>
            <h1 className="font-display text-4xl font-bold leading-none text-white sm:text-5xl">City Analytics</h1>
            <p className="text-sm text-white/55">Operational metrics and aesthetic activity indicators.</p>
          </div>
          <button
            onClick={refreshStats}
            disabled={loading}
            className="glass-button focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-40 self-start sm:self-auto"
          >
            {loading ? <Loader2 className="size-4 animate-spin text-cyan" /> : <Activity className="size-4" />}
            Refresh Matrix
          </button>
        </div>

        {loading || !stats ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-cyan" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Users */}
              <div className="glass-panel rounded-[28px] p-5 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 size-16 rounded-full bg-cyan/10 blur-lg" />
                <Users className="size-6 text-cyan mb-4" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Total Citizenry</p>
                <p className="text-4xl font-display font-extrabold text-white mt-1">{stats.totalUsers}</p>
              </div>

              {/* Active Users */}
              <div className="glass-panel rounded-[28px] p-5 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 size-16 rounded-full bg-neon/10 blur-lg" />
                <Activity className="size-6 text-neon mb-4" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Active Overlaps</p>
                <p className="text-4xl font-display font-extrabold text-white mt-1">{stats.activeUsers}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-neon"
                      style={{ width: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-neon">
                    {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                  </span>
                </div>
              </div>

              {/* Total Posts */}
              <div className="glass-panel rounded-[28px] p-5 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 size-16 rounded-full bg-violet/10 blur-lg" />
                <FileText className="size-6 text-violet mb-4" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Scrapbook Traces</p>
                <p className="text-4xl font-display font-extrabold text-white mt-1">{stats.totalPosts}</p>
              </div>

              {/* Engagement Rate */}
              <div className="glass-panel rounded-[28px] p-5 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 size-16 rounded-full bg-peach/10 blur-lg" />
                <TrendingUp className="size-6 text-peach mb-4" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Resonance Index</p>
                <p className="text-4xl font-display font-extrabold text-white mt-1">{stats.engagementRate}</p>
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/48">avg events / user</p>
              </div>
            </div>

            {/* Visual breakdown tables / progress elements */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Trending Spaces */}
              <div className="glass-panel rounded-[30px] p-5 sm:p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="size-5 text-cyan" />
                  <h2 className="text-lg font-extrabold text-white">Trending Spaces</h2>
                </div>
                <div className="space-y-4">
                  {stats.trendingSpaces.length > 0 ? (
                    stats.trendingSpaces.map((space: { spaceName: string; count: number }, i: number) => (
                      <div key={space.spaceName} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-white/80">
                            {i + 1}. {space.spaceName}
                          </span>
                          <span className="font-extrabold text-cyan">{space.count} posts</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan to-violet"
                            style={{
                              width: `${Math.round(
                                (space.count / Math.max(1, stats.trendingSpaces[0]?.count || 1)) * 100
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/45 italic text-center py-6">No trending space data recorded.</p>
                  )}
                </div>
              </div>

              {/* Fandoms & Hobbies popularity rankings */}
              <div className="glass-panel rounded-[30px] p-5 sm:p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="size-5 text-neon" />
                  <h2 className="text-lg font-extrabold text-white">Attribute Densities</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Top Fandoms */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet">Top Fandom Gravity</p>
                    <div className="space-y-2">
                      {stats.topFandoms.slice(0, 4).map((f: { name: string; count: number }) => (
                        <div key={f.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs border border-white/5">
                          <span className="font-semibold text-white/78">{f.name}</span>
                          <span className="font-bold text-violet">{f.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Hobbies */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan">Top Hobbies</p>
                    <div className="space-y-2">
                      {stats.topHobbies.slice(0, 4).map((h: { name: string; count: number }) => (
                        <div key={h.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs border border-white/5">
                          <span className="font-semibold text-white/78">{h.name}</span>
                          <span className="font-bold text-cyan">{h.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreatePostModal open={createPostOpen} onClose={() => setCreatePostOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
