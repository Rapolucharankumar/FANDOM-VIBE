"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Link2, MessageSquareText, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { vibes } from "@/lib/constants";
import type { Post, VibeTag } from "@/types/app";
import { useSpaces } from "@/hooks/use-db";

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (post: Pick<Post, "content" | "imageUrl" | "spaceId" | "moodTag" | "musicLink">) => void;
};

export function CreatePostModal({ open, onClose, onCreate }: CreatePostModalProps) {
  const { spaces } = useSpaces();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [musicLink, setMusicLink] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [moodTag, setMoodTag] = useState<VibeTag>("Midnight Energy");

  useEffect(() => {
    if (spaces.length > 0 && !spaceId) {
      setSpaceId(spaces[0].id);
    }
  }, [spaces, spaceId]);

  function submitPost() {
    const trimmed = content.trim();
    if (!trimmed && !imageUrl.trim()) return;

    onCreate({
      content: trimmed || "Shared a new visual mood.",
      imageUrl: imageUrl.trim() || undefined,
      musicLink: musicLink.trim() || undefined,
      spaceId,
      moodTag
    });
    setContent("");
    setImageUrl("");
    setMusicLink("");
    setSpaceId(spaces[0]?.id || "");
    setMoodTag("Midnight Energy");
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-end bg-ink/72 p-3 backdrop-blur-xl sm:place-items-center sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 38, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 26, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan">Create Post</p>
                <h2 className="mt-1 font-display text-3xl font-bold text-white">Drop a new feeling</h2>
              </div>
              <button
                onClick={onClose}
                className="focus-ring grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/8 text-white"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/78">
                  <MessageSquareText className="size-4 text-cyan" />
                  Thought
                </span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={5}
                  placeholder="Write the post like it belongs to a moodboard..."
                  className="focus-ring w-full resize-none rounded-3xl border border-white/12 bg-white/8 px-4 py-4 text-sm leading-6 text-white placeholder:text-white/35"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/78">
                    <ImagePlus className="size-4 text-neon" />
                    Image URL
                  </span>
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://..."
                    className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/35"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/78">
                    <Link2 className="size-4 text-peach" />
                    Music link
                  </span>
                  <input
                    value={musicLink}
                    onChange={(event) => setMusicLink(event.target.value)}
                    placeholder="Spotify, YouTube, SoundCloud"
                    className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/35"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 text-sm font-bold text-white/78">Space</span>
                  <select
                    value={spaceId}
                    onChange={(event) => setSpaceId(event.target.value)}
                    className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white"
                  >
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id} className="bg-midnight">
                        {space.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 text-sm font-bold text-white/78">Mood</span>
                  <select
                    value={moodTag}
                    onChange={(event) => setMoodTag(event.target.value as VibeTag)}
                    className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white"
                  >
                    {vibes.map((vibe) => (
                      <option key={vibe} value={vibe} className="bg-midnight">
                        {vibe}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={onClose} className="glass-button focus-ring rounded-2xl px-5 py-3 text-sm font-bold">
                Cancel
              </button>
              <button
                onClick={submitPost}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-5 py-3 text-sm font-extrabold text-white shadow-pink"
              >
                <Sparkles className="size-4" />
                Publish vibe
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
