"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/post-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { AppShell } from "@/components/layout/app-shell";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { useAuth, useFeed, useMatches } from "@/hooks/use-db";
import { dbClient } from "@/lib/db-client";
import { Heart, Bookmark, Loader2, Sparkles, MessageCircle, Rss } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/app";

type ProfileTab = "posts" | "liked" | "saved" | "comments";

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { posts: allPosts, addPost } = useFeed();
  const { matches, loading: matchesLoading } = useMatches(user?.id);
  
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadTabContent() {
      setLoadingContent(true);
      try {
        if (activeTab === "posts") {
          // User's own posts
          const p = allPosts.filter(x => x.user.id === user.id);
          setFilteredPosts(p);
        } else if (activeTab === "liked") {
          // Posts liked by user
          const postsList = await dbClient.getPosts();
          const likedPosts: Post[] = [];
          for (const post of postsList) {
            const isL = await dbClient.isPostLiked(post.id, user.id);
            if (isL) likedPosts.push(post);
          }
          setFilteredPosts(likedPosts);
        } else if (activeTab === "saved") {
          // Saved posts
          const saved = await dbClient.getSavedPosts();
          setFilteredPosts(saved);
        } else if (activeTab === "comments") {
          // Posts where user commented
          const postsList = await dbClient.getPosts();
          const commentedPosts: Post[] = [];
          for (const post of postsList) {
            const hasC = post.comments?.some(c => c.user.username === "You" || c.user.handle === user.handle);
            if (hasC) commentedPosts.push(post);
          }
          setFilteredPosts(commentedPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContent(false);
      }
    }

    loadTabContent();
  }, [activeTab, allPosts, user]);

  if (authLoading || !user) {
    return (
      <AppShell onCreatePost={() => setCreatePostOpen(true)}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-cyan" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell onCreatePost={() => setCreatePostOpen(true)}>
      <div className="space-y-6">
        <ProfileHeader
          profile={user}
          isCurrentUser={true}
          onEdit={() => setEditProfileOpen(true)}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Tabs & Posts list */}
          <div className="space-y-5 min-w-0">
            {/* Tab Selector */}
            <div className="glass-panel flex rounded-2xl p-1.5 overflow-x-auto gap-1">
              {[
                { id: "posts", label: "Posts", icon: Rss },
                { id: "liked", label: "Liked", icon: Heart },
                { id: "saved", label: "Saved", icon: Bookmark },
                { id: "comments", label: "Replies", icon: MessageCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={`focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition shrink-0 flex-1 ${
                      active
                        ? "bg-white/14 border border-white/10 text-white shadow-cyan"
                        : "text-white/60 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="space-y-5">
              {loadingContent ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-cyan" />
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] py-12 text-center text-white/55">
                  No scrapbook traces found here yet.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-8 xl:h-fit">
            {/* Stats Card */}
            <div className="glass-panel rounded-[30px] p-5">
              <h2 className="text-xl font-extrabold text-white">Vibe Stats</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  [user.fandoms?.length || 0, "fandoms"],
                  [user.hobbies?.length || 0, "hobbies"],
                  [user.vibes?.length || 0, "vibes"],
                  [filteredPosts.length, "tab activity"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/7 p-4">
                    <p className="text-2xl font-extrabold text-white">{value}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vibe Matches Recommendations */}
            <div className="glass-panel rounded-[30px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-white">Vibe Overlaps</h2>
                <Sparkles className="size-4 text-neon" />
              </div>
              <div className="space-y-3">
                {matchesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="size-5 animate-spin text-cyan" />
                  </div>
                ) : matches.slice(0, 3).map((match) => (
                  <Link
                    key={match.profile.id}
                    href={`/profile/${match.profile.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white/6 p-3 hover:bg-white/10 hover:border-white/20 border border-transparent transition"
                  >
                    <div className="relative size-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <Image
                        src={match.profile.profileImage}
                        alt={match.profile.username}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white leading-none">{match.profile.username}</p>
                      <p className="truncate text-xs text-white/46 mt-1">@{match.profile.handle}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-xs font-extrabold text-cyan shadow-cyan">
                      {match.percentage}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <CreatePostModal open={createPostOpen} onClose={() => setCreatePostOpen(false)} onCreate={addPost} />
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        profile={user}
        onSave={updateProfile}
      />
    </AppShell>
  );
}
