"use client";

import { Bell, Home, Plus, Sparkles, UserRound, UsersRound, Search, ShieldAlert, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth, useSignals } from "@/hooks/use-db";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: UsersRound },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Signals", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/admin", label: "Admin", icon: ShieldAlert }
];

type AppShellProps = {
  children: React.ReactNode;
  onCreatePost?: () => void;
};

export function AppShell({ children, onCreatePost }: AppShellProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { unreadCount } = useSignals();

  return (
    <div className="min-h-screen pb-24 text-white lg:pb-0">
      {/* Sidebar Navigation */}
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
            const isSignals = item.href === "/notifications";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border border-white/15 bg-white/14 text-white shadow-cyan"
                    : "text-white/62 hover:bg-white/8 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5" />
                  {item.label}
                </div>
                {isSignals && unreadCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-neon text-[10px] font-bold text-white shadow-pink animate-pulse">
                    {unreadCount}
                  </span>
                )}
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

        {/* User Card */}
        <div className="glass-panel absolute bottom-6 left-5 right-5 rounded-3xl p-4">
          {authLoading || !user ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-cyan" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <Image
                    src={user.profileImage}
                    alt={user.username}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{user.username}</p>
                  <p className="truncate text-xs text-white/50">@{user.handle}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-cyan/20 bg-cyan/10 p-3 text-xs leading-5 text-cyan-50">
                Your strong vibes today: {user.vibes.slice(0, 2).join(" & ") || "Open Explorer"}.
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
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

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:ml-72 lg:w-[calc(100%-18rem)] lg:max-w-none lg:px-8 lg:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-6 rounded-[28px] border border-white/12 bg-ink/76 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const isSignals = item.href === "/notifications";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition relative",
                active ? "bg-white/14 text-white" : "text-white/50"
              )}
            >
              <Icon className="size-5" />
              <span className="truncate max-w-[45px]">{item.label}</span>
              {isSignals && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-neon text-[8px] font-bold text-white shadow-pink">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
