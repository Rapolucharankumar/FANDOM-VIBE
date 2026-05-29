import { PostCard } from "@/components/feed/post-card";
import { ShellWithPostModal } from "@/components/layout/shell-with-post-modal";
import { ProfileHeader } from "@/components/profile/profile-header";
import { currentUser, posts } from "@/lib/mock-data";

export default function ProfilePage() {
  const profilePosts = posts.filter((post) => post.user.id === currentUser.id || post.user.fandoms.some((fandom) => currentUser.fandoms.includes(fandom)));

  return (
    <ShellWithPostModal>
      <div className="space-y-6">
        <ProfileHeader profile={currentUser} />
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {profilePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <aside className="glass-panel h-fit rounded-[30px] p-5 xl:sticky xl:top-8">
            <h2 className="text-xl font-extrabold text-white">Profile world</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["3", "fandoms"],
                ["4", "hobbies"],
                ["3", "vibes"],
                ["3", "badges"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/7 p-4">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">{label}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </ShellWithPostModal>
  );
}
