"use client";

import { useState } from "react";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { HomeFeed, useLocalFeed } from "@/components/feed/home-feed";
import { AppShell } from "@/components/layout/app-shell";

export function HomeExperience() {
  const [open, setOpen] = useState(false);
  const { posts, addPost } = useLocalFeed();

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      <HomeFeed posts={posts} onCreatePost={() => setOpen(true)} />
      <CreatePostModal open={open} onClose={() => setOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
