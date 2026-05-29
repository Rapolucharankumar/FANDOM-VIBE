"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Music2, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Tag } from "@/components/ui/tag";
import type { Post } from "@/types/app";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);

  const likeCount = useMemo(() => post.likes + (liked ? 1 : 0), [liked, post.likes]);

  function addComment() {
    const trimmed = comment.trim();
    if (!trimmed) return;

    setComments((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        content: trimmed,
        createdAt: "now",
        user: {
          username: "You",
          handle: "yourvibe",
          profileImage:
            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"
        }
      }
    ]);
    setComment("");
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
          <Image
            src={post.user.profileImage}
            alt={post.user.username}
            width={96}
            height={96}
            className="size-12 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{post.user.username}</p>
            <p className="truncate text-xs text-white/48">
              @{post.user.handle} · {post.createdAt}
            </p>
          </div>
          <Tag tone="violet">{post.moodTag}</Tag>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-white/82">{post.content}</p>

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
            className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan-50"
          >
            <Music2 className="size-4" />
            Attached track inspiration
          </a>
        ) : null}

        <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setLiked((value) => !value)}
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
          <button className="glass-button focus-ring ml-auto grid size-11 place-items-center rounded-2xl" aria-label="Share">
            <Send className="size-4" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {comments.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              {comments.slice(-2).map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-white/6 p-3">
                  <Image
                    src={item.user.profileImage}
                    alt={item.user.username}
                    width={72}
                    height={72}
                    className="size-9 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{item.user.username}</p>
                    <p className="text-sm leading-6 text-white/68">{item.content}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 p-2">
          <Sparkles className="ml-2 size-4 shrink-0 text-cyan" />
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addComment();
            }}
            placeholder="Add a feeling, theory, or tiny confession"
            className="focus-ring min-h-10 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/38"
          />
          <button
            onClick={addComment}
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
