"use client";

import { Bell, Home, Plus, Sparkles, UserRound, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { currentUser } from "@/lib/mock-data";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/notifications", label: "Alerts", icon: Bell }
];

type AppShellProps = {
  children: React.ReactNode;
  onCreatePost?: () => void;
};

export function AppShell({ children, onCreatePost }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pb-24 text-white lg:pb-0">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-ink/58 px-5 py-6 backdrop-blur-2xl lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-glow">
            <Sparkles className="size-5 text-cyan" />
          </span>
          <span>
            <span className="block font-display text-2xl font-bold leading-none">Fandom Vibe</span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">digital city</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border border-white/15 bg-white/14 text-white shadow-cyan"
                    : "text-white/62 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onCreatePost}
          className="focus-ring mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-4 py-3 text-sm font-extrabold text-white shadow-pink transition hover:-translate-y-0.5"
        >
          <Plus className="size-5" />
          Create Post
        </button>

        <div className="glass-panel absolute bottom-6 left-5 right-5 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <Image
              src={currentUser.profileImage}
              alt={currentUser.username}
              width={96}
              height={96}
              className="size-12 rounded-2xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{currentUser.username}</p>
              <p className="truncate text-xs text-white/50">@{currentUser.handle}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-cyan/20 bg-cyan/10 p-3 text-xs leading-5 text-cyan-50">
            Your strongest overlap today is Cozy Cafe x Film Aesthetic.
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/60 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 font-display text-xl font-bold">
            <Sparkles className="size-5 text-cyan" />
            Fandom Vibe
          </Link>
          <button
            onClick={onCreatePost}
            className="focus-ring grid size-10 place-items-center rounded-2xl bg-neon text-white shadow-pink"
            aria-label="Create post"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:ml-72 lg:w-[calc(100%-18rem)] lg:max-w-none lg:px-8 lg:py-8">
        {children}
      </main>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 rounded-[28px] border border-white/12 bg-ink/76 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition",
                active ? "bg-white/14 text-white" : "text-white/50"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
