"use client";

import { motion } from "framer-motion";
import { Radio, UsersRound } from "lucide-react";
import Image from "next/image";
import { Tag } from "@/components/ui/tag";
import type { Space } from "@/types/app";
import { useSpaceMembership } from "@/hooks/use-db";

type SpaceCardProps = {
  space: Space;
};

export function SpaceCard({ space }: SpaceCardProps) {
  const { isMember, loading, joinSpace, leaveSpace } = useSpaceMembership(space.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isMember) {
        await leaveSpace();
      } else {
        await joinSpace();
      }
    } catch (err) {
      console.error("Failed to toggle space membership:", err);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="glass-panel overflow-hidden rounded-[30px]"
    >
      <div className="relative h-52">
        <Image src={space.coverImage} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/24 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <Tag tone="cyan">{space.vibe}</Tag>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">{space.name}</h2>
          </div>
          {!loading && (
            <button
              onClick={handleToggle}
              className={`focus-ring rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                isMember 
                  ? "bg-white/20 text-white border border-white/30 hover:bg-white/30" 
                  : "bg-cyan text-ink font-extrabold hover:bg-cyan/80"
              }`}
            >
              {isMember ? "Joined" : "Join"}
            </button>
          )}
        </div>
      </div>
      <div className="p-5">
        <p className="min-h-12 text-sm leading-6 text-white/62">{space.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
            <UsersRound className="mb-2 size-4 text-peach" />
            <p className="text-lg font-extrabold text-white">{space.members}</p>
            <p className="text-xs text-white/45">members</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
            <Radio className="mb-2 size-4 text-neon" />
            <p className="text-lg font-extrabold text-white">{space.liveNow}</p>
            <p className="text-xs text-white/45">live now</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
