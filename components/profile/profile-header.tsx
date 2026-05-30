"use client";

import { BadgeCheck, Camera, Music2, Sparkles, UserPlus, UserCheck, Users } from "lucide-react";
import Image from "next/image";
import { Tag } from "@/components/ui/tag";
import type { UserProfile } from "@/types/app";
import { useFollow } from "@/hooks/use-db";
import { clsx } from "clsx";

type ProfileHeaderProps = {
  profile: UserProfile;
  isCurrentUser?: boolean;
  onEdit?: () => void;
};

export function ProfileHeader({ profile, isCurrentUser = false, onEdit }: ProfileHeaderProps) {
  const { following, followers, followingList, toggleFollow, loading } = useFollow(profile.id);

  return (
    <section className="glass-panel overflow-hidden rounded-[34px]">
      <div className="relative h-52 sm:h-64">
        <Image
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) calc(100vw - 18rem), 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/42 to-transparent" />
      </div>
      <div className="-mt-16 px-5 pb-6 sm:px-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative size-32 rounded-[32px] border-4 border-ink overflow-hidden shrink-0 shadow-2xl">
              <Image
                src={profile.profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"}
                alt={profile.username}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{profile.username}</h1>
                <BadgeCheck className="size-6 text-cyan" />
              </div>
              <p className="mt-1 text-sm font-semibold text-white/48">@{profile.handle}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{profile.bio}</p>

              {/* Follower / Following counts */}
              <div className="mt-3 flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <Users className="size-4 text-cyan" />
                  <span className="text-sm font-extrabold text-white">{followers.length}</span>
                  <span className="text-xs text-white/50">followers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">{followingList.length}</span>
                  <span className="text-xs text-white/50">following</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isCurrentUser ? (
              <button
                onClick={onEdit}
                className="glass-button focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold"
              >
                <Camera className="size-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={loading}
                className={clsx(
                  "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition disabled:opacity-50",
                  following
                    ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                    : "bg-gradient-to-r from-violet via-neon to-peach text-white shadow-pink hover:-translate-y-0.5"
                )}
              >
                {following ? (
                  <>
                    <UserCheck className="size-4 text-cyan" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-wrap gap-2 content-start">
            {(profile.fandoms || []).map((tag) => (
              <Tag key={tag} tone="violet">
                {tag}
              </Tag>
            ))}
            {(profile.hobbies || []).map((tag) => (
              <Tag key={tag} tone="cyan">
                {tag}
              </Tag>
            ))}
            {(profile.vibes || []).map((tag) => (
              <Tag key={tag} tone="pink">
                {tag}
              </Tag>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="size-4 text-peach" />
              Aesthetic badges
            </p>
            <div className="space-y-2">
              {(profile.badges || ["First Light", "Dreamer"]).map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-white/68">
                  <Music2 className="size-4 text-cyan" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

