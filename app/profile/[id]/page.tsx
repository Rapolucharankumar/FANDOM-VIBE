"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { dbClient } from "@/lib/db-client";
import { useAuth, useFeed } from "@/hooks/use-db";
import type { UserProfile } from "@/types/app";
import { Loader2, Sparkles, Check } from "lucide-react";

type ProfileDetailsProps = {
  params: Promise<{ id: string }>;
};

type MatchDataState = {
  percentage: number;
  sharedFandoms: string[];
  sharedHobbies: string[];
  sharedVibes: string[];
};

export default function UserProfileDetails({ params }: ProfileDetailsProps) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;
  
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { posts: allPosts, addPost } = useFeed();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchData, setMatchData] = useState<MatchDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.id === targetId) {
      router.replace("/profile");
      return;
    }

    async function loadUserProfile() {
      setLoading(true);
      try {
        const u = await dbClient.getUserProfile(targetId);
        if (u) {
          setProfile(u);
          // Calculate vibe matches
          const matches = await dbClient.getVibeMatches(currentUser.id);
          const currentMatch = matches.find(m => m.profile.id === targetId);
          if (currentMatch) {
            setMatchData(currentMatch);
          } else {
            // Recalculate on-the-fly locally
            const calc = dbClient.calculateVibeMatchLocal(currentUser, u);
            setMatchData({
              percentage: calc.percentage,
              sharedFandoms: calc.sharedFandoms,
              sharedHobbies: calc.sharedHobbies,
              sharedVibes: calc.sharedVibes
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [targetId, currentUser, router]);

  const userPosts = allPosts.filter(p => p.user.id === targetId);

  if (loading || !profile) {
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
          profile={profile}
          isCurrentUser={false}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* User's posts */}
          <div className="space-y-5 min-w-0">
            <h2 className="text-xl font-extrabold text-white">Scrapbook logs</h2>
            <div className="space-y-5">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] py-12 text-center text-white/55">
                  No post traces left by this user yet.
                </div>
              )}
            </div>
          </div>

          {/* Vibe matching statistics sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-8 xl:h-fit">
            {/* Vibe Match Core */}
            {matchData && (
              <div className="glass-panel rounded-[30px] p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-cyan/10 blur-xl" />
                <div className="absolute bottom-0 left-0 -ml-6 -mb-6 size-24 rounded-full bg-neon/10 blur-xl" />
                
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-cyan/12 text-cyan shadow-glow">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Connection Density</h3>
                    <p className="text-xs text-white/46">computed in real-time</p>
                  </div>
                </div>

                <div className="my-6 text-center">
                  <span className="font-display text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan via-violet to-neon">
                    {matchData.percentage}%
                  </span>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan">Vibe Overlap</p>
                </div>

                {/* Shared interests list */}
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/48">Shared Passports</p>
                  
                  {/* Fandoms */}
                  {matchData.sharedFandoms.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet">Fandoms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchData.sharedFandoms.map((f: string) => (
                          <div key={f} className="inline-flex items-center gap-1 rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-xs text-lavender">
                            <Check className="size-3 text-cyan" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbies */}
                  {matchData.sharedHobbies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan">Hobbies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchData.sharedHobbies.map((h: string) => (
                          <div key={h} className="inline-flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-xs text-cyan-100">
                            <Check className="size-3 text-cyan" />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vibes */}
                  {matchData.sharedVibes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neon">Aesthetic Vibes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchData.sharedVibes.map((v: string) => (
                          <div key={v} className="inline-flex items-center gap-1 rounded-full border border-neon/30 bg-neon/10 px-2 py-0.5 text-xs text-pink-100">
                            <Check className="size-3 text-cyan" />
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchData.sharedFandoms.length === 0 &&
                   matchData.sharedHobbies.length === 0 &&
                   matchData.sharedVibes.length === 0 && (
                     <p className="text-xs text-white/45 italic">No overlapping passport items found yet.</p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>

      <CreatePostModal open={createPostOpen} onClose={() => setCreatePostOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
