"use client";

import { MessageSquareText, Plus, Loader2 } from "lucide-react";
import { ShellWithPostModal } from "@/components/layout/shell-with-post-modal";
import { SpaceCard } from "@/components/spaces/space-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSpaces, useFeed } from "@/hooks/use-db";

export default function SpacesPage() {
  const { spaces, loading: spacesLoading } = useSpaces();
  const { posts, loading: feedLoading } = useFeed();

  const loading = spacesLoading || feedLoading;

  return (
    <ShellWithPostModal>
      <div className="space-y-7">
        <SectionHeading
          eyebrow="Community Spaces"
          title="Mini worlds for every mood."
          copy="Each room is designed around a social ritual: late-night thoughts, cafe softness, style boards, beat-making, and watchlist devotion."
          action={
            <button className="glass-button focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold">
              <Plus className="size-4" />
              Suggest Space
            </button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin text-cyan" />
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>

            <section className="glass-panel rounded-[30px] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-neon/14 text-neon">
                  <MessageSquareText className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Fresh discussions</h2>
                  <p className="text-sm text-white/48">Threads bubbling across the city.</p>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {posts.slice(0, 4).map((post) => {
                  const space = spaces.find((item) => item.id === post.spaceId);
                  return (
                    <article key={post.id} className="rounded-3xl border border-white/10 bg-white/7 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">{space?.name || "Global"}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{post.content}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </ShellWithPostModal>
  );
}
