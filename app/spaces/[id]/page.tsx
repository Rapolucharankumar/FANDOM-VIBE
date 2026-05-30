"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Radio, UsersRound, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShellWithPostModal } from "@/components/layout/shell-with-post-modal";
import { SpaceChat } from "@/components/spaces/space-chat";
import { LiveRoom } from "@/components/spaces/live-room";
import { Tag } from "@/components/ui/tag";
import { useSpaces, useSpaceMembership, useSpaceChat, useSpacePresence } from "@/hooks/use-db";

function formatCount(n: number | undefined | null): string {
  if (n === undefined || n === null) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function SpaceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { spaces, loading: spacesLoading } = useSpaces();
  const { isMember, loading: memberLoading, joinSpace, leaveSpace } = useSpaceMembership(id);
  const { messages, loading: chatLoading, sending, sendMessage } = useSpaceChat(id);
  const { onlineCount, onlineUsers } = useSpacePresence(id);
  const [showLiveRoom, setShowLiveRoom] = useState(false);

  const space = spaces.find((s) => s.id === id);

  if (spacesLoading) {
    return (
      <ShellWithPostModal>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-cyan" />
        </div>
      </ShellWithPostModal>
    );
  }

  if (!space) {
    return (
      <ShellWithPostModal>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-bold text-white/60">Space not found</p>
          <Link href="/spaces" className="mt-4 text-sm text-cyan hover:underline">
            ← Back to spaces
          </Link>
        </div>
      </ShellWithPostModal>
    );
  }

  const handleToggleMembership = async () => {
    try {
      if (isMember) {
        await leaveSpace();
      } else {
        await joinSpace();
      }
    } catch (err) {
      console.error("Failed to toggle membership:", err);
    }
  };

  return (
    <ShellWithPostModal>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to spaces
        </Link>

        {/* Space Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel overflow-hidden rounded-[32px]"
        >
          <div className="relative h-56 sm:h-64">
            <Image
              src={space.coverImage}
              alt={space.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div>
                <Tag tone="cyan">{space.vibe}</Tag>
                <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  {space.name}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">{space.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {isMember && (
                  <button
                    onClick={() => setShowLiveRoom(!showLiveRoom)}
                    className="focus-ring shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-md bg-white text-ink hover:bg-white/90"
                  >
                    {showLiveRoom ? "Leave Room" : "🎧 Join Audio Room"}
                  </button>
                )}
                {!memberLoading && (
                  <button
                    onClick={handleToggleMembership}
                    className={`focus-ring shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-md ${
                      isMember
                        ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                        : "bg-cyan text-ink font-extrabold hover:bg-cyan/80"
                    }`}
                  >
                    {isMember ? "Joined ✓" : "Join Space"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 border-t border-white/8 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <UsersRound className="size-4 text-peach" />
              <span className="text-sm font-bold text-white">{formatCount(space.members)}</span>
              <span className="text-xs text-white/40">members</span>
            </div>
            <div className="flex items-center gap-2.5">
              {onlineCount > 0 && (
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-neon" />
                </span>
              )}
              <Radio className="size-4 text-neon" />
              <span className="text-sm font-bold text-white">{onlineCount}</span>
              <span className="text-xs text-white/40">live now</span>
            </div>
            {onlineUsers.length > 0 && (
              <div className="ml-auto hidden items-center gap-1.5 sm:flex">
                {onlineUsers.slice(0, 5).map((u) => (
                  <span
                    key={u.userId}
                    className="rounded-lg bg-white/8 px-2 py-1 text-[10px] font-semibold text-white/50"
                    title={u.username}
                  >
                    {u.username}
                  </span>
                ))}
                {onlineUsers.length > 5 && (
                  <span className="text-[10px] text-white/30">+{onlineUsers.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className={showLiveRoom ? "grid gap-6 lg:grid-cols-[1fr_380px]" : ""}>
          {showLiveRoom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1"
            >
              <LiveRoom roomName={`space-${id}`} onLeave={() => setShowLiveRoom(false)} />
            </motion.div>
          )}

          {/* Live Chat */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={showLiveRoom ? "h-[500px] lg:col-span-1" : ""}
          >
            <SpaceChat
              messages={messages}
              loading={chatLoading}
              sending={sending}
              onSend={sendMessage}
              isMember={isMember}
            />
          </motion.div>
        </div>
      </div>
    </ShellWithPostModal>
  );
}
