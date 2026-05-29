"use client";

import { motion } from "framer-motion";
import { Chrome, Loader2, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type AuthPanelProps = {
  mode: "login" | "signup";
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (!isSupabaseConfigured || !supabase) {
        window.localStorage.setItem(
          "fandom-vibe-demo-user",
          JSON.stringify({ email, username: username || "demo dreamer" })
        );
        router.push(isSignup ? "/onboarding" : "/home");
        return;
      }

      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });
        if (error) throw error;
        router.push("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/home");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went out of tune.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      router.push("/onboarding");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      }
    });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-34"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/88 to-midnight/94" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md rounded-[32px] p-5 sm:p-7"
      >
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/72">
          <Sparkles className="size-5 text-cyan" />
          Fandom Vibe
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">
            {isSignup ? "Claim your world" : "Welcome back"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">
            {isSignup ? "Build your vibe profile." : "Enter your universe."}
          </h1>
        </div>

        <button
          onClick={continueWithGoogle}
          className="glass-button focus-ring mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-2xl text-sm font-extrabold"
        >
          <Chrome className="size-4" />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/34">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isSignup ? (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/72">
                <UserRound className="size-4 text-neon" />
                Username
              </span>
              <input
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white placeholder:text-white/35"
                placeholder="your cinematic alias"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/72">
              <Mail className="size-4 text-cyan" />
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white placeholder:text-white/35"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-2 text-sm font-bold text-white/72">
              <span className="flex items-center gap-2">
                <LockKeyhole className="size-4 text-peach" />
                Password
              </span>
              {!isSignup && (
                <Link href="/password-reset" className="text-xs font-semibold text-cyan hover:underline">
                  Forgot?
                </Link>
              )}
            </span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-white placeholder:text-white/35"
              placeholder="at least 6 characters"
            />
          </label>

          {status ? <p className="rounded-2xl bg-neon/12 px-4 py-3 text-sm text-pink-100">{status}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach text-sm font-extrabold text-white shadow-pink disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {isSignup ? "Start onboarding" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          {isSignup ? "Already have a universe?" : "New to the city?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-bold text-cyan">
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
