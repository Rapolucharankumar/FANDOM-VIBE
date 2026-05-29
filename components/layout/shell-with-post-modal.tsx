"use client";

import { useState } from "react";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { AppShell } from "@/components/layout/app-shell";
import { useFeed } from "@/hooks/use-db";

type ShellWithPostModalProps = {
  children: React.ReactNode;
};

export function ShellWithPostModal({ children }: ShellWithPostModalProps) {
  const [open, setOpen] = useState(false);
  const { addPost } = useFeed();

  return (
    <AppShell onCreatePost={() => setOpen(true)}>
      {children}
      <CreatePostModal open={open} onClose={() => setOpen(false)} onCreate={addPost} />
    </AppShell>
  );
}
