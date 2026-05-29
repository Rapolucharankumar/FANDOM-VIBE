"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Music2, Send, Sparkles, Bookmark, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Tag } from "@/components/ui/tag";
import type { Post } from "@/types/app";
import { usePostActions } from "@/hooks/use-db";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const [commentInput, setCommentInput] = useState("");
  const { liked, saved, likeCount, comments, toggleLike, toggleSave, addComment } = usePostActions(post);

  async function handleCommentSubmit() {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    try {
      await addComment(trimmed);
      setCommentInput("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="glass-panel overflow-hidden rounded-[28px]"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.id}`} className="relative size-12 shrink-0 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition">
            <Image
              src={post.user.profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"}
              alt={post.user.username}
              fill
              sizes="48px"
              className="object-cover"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${post.user.id}`} className="truncate text-sm font-bold text-white hover:text-cyan transition block">
              {post.user.username}
            </Link>
            <p className="truncate text-xs text-white/48">
              @{post.user.handle} · {post.createdAt}
            </p>
          </div>
          <Tag tone="violet">{post.moodTag}</Tag>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-white/82 whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl ? (
          <div className="relative mt-5 h-72 overflow-hidden rounded-3xl border border-white/10 sm:h-96">
            <Image src={post.imageUrl} alt="" fill sizes="(min-width: 1280px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}

        {post.musicLink ? (
          <a
            href={post.musicLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan-50 hover:bg-cyan/15 transition"
          >
            <Music2 className="size-4 text-cyan" />
            Attached track inspiration
          </a>
        ) : null}

        <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
          <button
            onClick={toggleLike}
            className="glass-button focus-ring flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold"
            aria-pressed={liked}
          >
            <Heart className={liked ? "size-4 fill-neon text-neon" : "size-4"} />
            {likeCount}
          </button>
          <div className="glass-button flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold">
            <MessageCircle className="size-4" />
            {comments.length}
          </div>
          
          <button
            onClick={toggleSave}
            className="glass-button focus-ring ml-auto grid size-11 place-items-center rounded-2xl"
            aria-label="Save post"
          >
            <Bookmark className={saved ? "size-4 fill-peach text-peach" : "size-4"} />
          </button>
          <button className="glass-button focus-ring grid size-11 place-items-center rounded-2xl" aria-label="Share">
            <Share2 className="size-4" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {comments.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 overflow-hidden border-t border-white/5 pt-3"
            >
              {comments.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-white/6 p-3">
                  <div className="relative size-9 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image
                      src={item.user.profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"}
                      alt={item.user.username}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white">
                      {item.user.username} <span className="text-[10px] font-normal text-white/40">@{item.user.handle}</span>
                    </p>
                    <p className="text-sm leading-6 text-white/68 whitespace-pre-wrap">{item.content}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 p-2">
          <Sparkles className="ml-2 size-4 shrink-0 text-cyan" />
          <input
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCommentSubmit();
            }}
            placeholder="Add a feeling, theory, or tiny confession"
            className="focus-ring min-h-10 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/38 border-none outline-none"
          />
          <button
            onClick={handleCommentSubmit}
            className="focus-ring grid size-10 place-items-center rounded-xl bg-white/12 text-white transition hover:bg-white/20"
            aria-label="Post comment"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
