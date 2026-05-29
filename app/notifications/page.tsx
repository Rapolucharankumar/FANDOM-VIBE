import { BellRing, Heart, MessageCircle, Sparkles, UserRoundPlus } from "lucide-react";
import { ShellWithPostModal } from "@/components/layout/shell-with-post-modal";
import { SectionHeading } from "@/components/ui/section-heading";

const notifications = [
  {
    icon: Heart,
    title: "Sana Bloom liked your Midnight Thoughts post.",
    time: "2 min ago",
    tone: "text-neon bg-neon/14"
  },
  {
    icon: MessageCircle,
    title: "Juno Park replied: This belongs on the landing page of my brain.",
    time: "12 min ago",
    tone: "text-cyan bg-cyan/14"
  },
  {
    icon: UserRoundPlus,
    title: "Kai Denim matched with your Streetwear and EXO tags.",
    time: "38 min ago",
    tone: "text-peach bg-peach/14"
  },
  {
    icon: Sparkles,
    title: "Cozy Cafe is especially active for your vibe tonight.",
    time: "1 hr ago",
    tone: "text-lavender bg-violet/14"
  }
];

export default function NotificationsPage() {
  return (
    <ShellWithPostModal>
      <div className="mx-auto max-w-4xl space-y-7">
        <SectionHeading
          eyebrow="Notifications"
          title="Tiny signals from your city."
          copy="Likes, comments, mood matches, and space activity are grouped into a calmer alert surface."
        />

        <section className="glass-panel rounded-[30px] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/7 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan/12 text-cyan">
              <BellRing className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Today feels active</p>
              <p className="text-sm text-white/50">4 new signals since your last check-in.</p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="flex gap-3 rounded-3xl border border-white/10 bg-white/7 p-4">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-6 text-white">{item.title}</p>
                    <p className="text-xs text-white/42">{item.time}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </ShellWithPostModal>
  );
}
