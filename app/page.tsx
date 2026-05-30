"use client";

import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Images, MessageCircle, Music2, Sparkles, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { posts, spaces } from "@/lib/mock-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const floatingCards = [
  {
    label: "Midnight Energy",
    title: "Late-night lyric thread",
    icon: MessageCircle,
    className: "right-10 top-[54%] hidden w-60 xl:block"
  },
  {
    label: "Cozy Cafe",
    title: "218 people journaling",
    icon: HeartHandshake,
    className: "right-6 top-[22%] hidden w-64 md:block"
  },
  {
    label: "Producer Space",
    title: "New beat snippet dropped",
    icon: Music2,
    className: "bottom-10 right-[18%] hidden w-64 xl:block"
  }
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/home");
        }
      }
    }
    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen text-white">
      <section className="relative min-h-[88vh] overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <Image
          src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2200&q=85"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/96 via-ink/78 to-midnight/74" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-glow backdrop-blur-xl">
              <Sparkles className="size-5 text-cyan" />
            </span>
            <span>
              <span className="block font-display text-2xl font-bold leading-none">Fandom Vibe</span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">where fandom meets lifestyle</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/login" className="glass-button focus-ring rounded-2xl px-4 py-2 text-sm font-bold">
              Log in
            </Link>
            <Link
              href="/signup"
              className="focus-ring rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-cyan"
            >
              Sign up
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[calc(88vh-96px)] max-w-7xl items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-4xl pb-16 pt-24 sm:pt-16"
          >
            <Tag tone="cyan">A digital universe where fandom meets lifestyle</Tag>
            <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Fandom Vibe
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/74 sm:text-2xl">
              Find your people through the things you love, the hobbies you repeat, and the feelings you cannot quite explain.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-6 py-4 text-sm font-extrabold text-white shadow-pink"
              >
                Enter the universe
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {floatingCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { delay: 0.25 + index * 0.12, duration: 0.45 },
                y: { delay: index * 0.2, duration: 5.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className={`glass-panel absolute z-10 rounded-[28px] p-4 ${card.className}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                  <Icon className="size-5 text-cyan" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{card.label}</p>
                  <p className="mt-1 text-sm font-extrabold text-white">{card.title}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="MVP experience"
            title="A social city organized by emotional overlap."
            copy="The first build brings together onboarding, communities, posting, profiles, comments, and a cinematic feed that already feels different from a generic social timeline."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: UsersRound,
                title: "Vibe-based spaces",
                copy: "Midnight Thoughts, Cozy Cafe, Fashion Room, Producer Space, and Anime & K-Drama Club."
              },
              {
                icon: Images,
                title: "Scrapbook posting",
                copy: "Text, images, mood tags, and optional music links in one expressive composer."
              },
              {
                icon: Sparkles,
                title: "Identity signals",
                copy: "Fandoms, hobbies, and aesthetics become the foundation for future recommendations."
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="glass-panel rounded-[28px] p-5">
                  <div className="grid size-12 place-items-center rounded-2xl bg-cyan/12 text-cyan">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-extrabold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="glass-panel overflow-hidden rounded-[32px]">
            <div className="relative h-72">
              <Image src={spaces[1].coverImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <Tag tone="pink">{spaces[1].vibe}</Tag>
              <h2 className="mt-4 font-display text-4xl font-bold text-white">{spaces[1].name}</h2>
              <p className="mt-3 text-sm leading-6 text-white/62">{spaces[1].description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {posts.slice(0, 2).map((post) => (
              <article key={post.id} className="glass-panel rounded-[28px] p-5">
                <div className="flex items-center gap-3">
                  <Image src={post.user.profileImage} alt="" width={88} height={88} className="size-11 rounded-2xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-white">{post.user.username}</p>
                    <p className="text-xs text-white/42">{post.createdAt}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{post.content}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
