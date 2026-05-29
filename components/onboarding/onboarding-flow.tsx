"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Camera, Check, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Tag } from "@/components/ui/tag";
import { fandoms, hobbies, vibes } from "@/lib/constants";
import { dbClient } from "@/lib/db-client";
import type { Fandom, Hobby, VibeTag } from "@/types/app";

const steps = [
  {
    title: "Choose your fandom gravity.",
    eyebrow: "Fandoms",
    copy: "Pick the artists and worlds that already shape your style.",
    items: fandoms
  },
  {
    title: "Add the rituals you live through.",
    eyebrow: "Hobbies",
    copy: "These become the social signals behind your home feed.",
    items: hobbies
  },
  {
    title: "Name the feeling.",
    eyebrow: "Vibes",
    copy: "Your aesthetic tags tell the city what kind of rooms to open first.",
    items: vibes
  }
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({
    Fandoms: [],
    Hobbies: [],
    Vibes: []
  });

  const current = steps[step];
  const completeCount = Object.values(selected).reduce((total, values) => total + values.length, 0);
  const canContinue = selected[current.eyebrow].length > 0;

  const previewTags = useMemo(() => Object.values(selected).flat().slice(0, 9), [selected]);

  function toggle(item: string) {
    setSelected((value) => {
      const group = value[current.eyebrow];
      return {
        ...value,
        [current.eyebrow]: group.includes(item) ? group.filter((entry) => entry !== item) : [...group, item]
      };
    });
  }

  async function next() {
    if (!canContinue) return;
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }

    window.localStorage.setItem("fandom-vibe-onboarding", JSON.stringify(selected));
    try {
      const currentId = await dbClient.getCurrentUserId();
      await dbClient.updateProfile(currentId, {
        fandoms: selected.Fandoms as Fandom[],
        hobbies: selected.Hobbies as Hobby[],
        vibes: selected.Vibes as VibeTag[]
      });
    } catch (err) {
      console.error("Failed to save onboarding data to profile", err);
    }
    router.push("/home");
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="glass-panel rounded-[34px] p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan">
              <Sparkles className="size-4" />
              Onboarding
            </div>
            <p className="text-sm font-bold text-white/55">
              {step + 1} / {steps.length}
            </p>
          </div>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan via-violet to-neon"
              initial={false}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.eyebrow}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
              className="mt-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-peach">{current.eyebrow}</p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
                {current.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/62 sm:text-base">{current.copy}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {current.items.map((item, index) => {
                  const picked = selected[current.eyebrow].includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggle(item)}
                      className="focus-ring group relative min-h-24 overflow-hidden rounded-3xl border border-white/12 bg-white/8 p-4 text-left transition hover:-translate-y-1 hover:border-white/28 hover:bg-white/12"
                    >
                      <span className="relative z-10 flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-base font-extrabold text-white">{item}</span>
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-white/36">
                            signal {String(index + 1).padStart(2, "0")}
                          </span>
                        </span>
                        <span className="grid size-9 place-items-center rounded-2xl border border-white/12 bg-white/8">
                          {picked ? <Check className="size-4 text-cyan" /> : <Heart className="size-4 text-white/45" />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
              className="glass-button focus-ring rounded-2xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            <button
              onClick={next}
              disabled={!canContinue}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-5 py-3 text-sm font-extrabold text-white shadow-pink disabled:cursor-not-allowed disabled:opacity-45"
            >
              {step === steps.length - 1 ? "Enter the city" : "Continue"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <aside className="glass-panel h-fit rounded-[34px] p-5 sm:p-6 lg:sticky lg:top-8">
          <div className="relative h-64 overflow-hidden rounded-[28px] border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80"
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/18 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan">
                <Camera className="size-4" />
                Vibe Passport
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">{completeCount} signals saved</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {previewTags.length > 0 ? (
              previewTags.map((tag) => (
                <Tag key={tag} tone="pink">
                  {tag}
                </Tag>
              ))
            ) : (
              <p className="text-sm leading-6 text-white/55">Your passport fills as you choose tags.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
