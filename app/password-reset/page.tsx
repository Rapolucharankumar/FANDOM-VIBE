"use client";

import { motion } from "framer-motion";
import { Loader2, LockKeyhole, Mail, Sparkles, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Check if the user is redirected here via a recovery link (an active session will exist)
    async function checkSession() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsResetting(true);
        }
      }
    }
    checkSession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setSuccess(false);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured. Demo password reset is simulated.");
      }

      if (isResetting) {
        // Set new password
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccess(true);
        setStatus("Your password has been successfully updated!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Request reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/password-reset`
        });
        if (error) throw error;
        setSuccess(true);
        setStatus("Reset link sent! Please check your email inbox.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to process request.");
    } finally {
      setLoading(false);
    }
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
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/72">
          <ArrowLeft className="size-4" />
          Back to Login
        </Link>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">
            Security Gate
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">
            {isResetting ? "Set New Password" : "Reset Password"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {isResetting 
              ? "Resonate your new credentials into the network."
              : "Enter your email address to receive a recovery link."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isResetting ? (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/72">
                <LockKeyhole className="size-4 text-peach" />
                New Password
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
          ) : (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/72">
                <Mail className="size-4 text-cyan" />
                Email Address
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
          )}

          {status ? (
            <p className={`rounded-2xl px-4 py-3 text-sm ${success ? 'bg-cyan/12 text-cyan' : 'bg-neon/12 text-pink-100'}`}>
              {status}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach text-sm font-extrabold text-white shadow-pink disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {isResetting ? "Update Password" : "Send Recovery Email"}
          </button>
        </form>
      </motion.section>
    </main>
  );
}
