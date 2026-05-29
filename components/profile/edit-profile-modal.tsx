"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { fandoms as allFandoms, hobbies as allHobbies, vibes as allVibes } from "@/lib/constants";
import { Tag } from "@/components/ui/tag";
import type { UserProfile, Fandom, Hobby, VibeTag } from "@/types/app";

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
};

export function EditProfileModal({ open, onClose, profile, onSave }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [profileImage, setProfileImage] = useState(profile.profileImage);
  const [fandoms, setFandoms] = useState<Fandom[]>(profile.fandoms || []);
  const [hobbies, setHobbies] = useState<Hobby[]>(profile.hobbies || []);
  const [vibes, setVibes] = useState<VibeTag[]>(profile.vibes || []);
  const [saving, setSaving] = useState(false);

  const toggleFandom = (item: Fandom) => {
    setFandoms(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const toggleHobby = (item: Hobby) => {
    setHobbies(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const toggleVibe = (item: VibeTag) => {
    setVibes(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    if (!username.trim() || !handle.trim()) return;
    setSaving(true);
    try {
      await onSave({
        username,
        handle: handle.replace(/\s/g, "").toLowerCase(),
        bio,
        profileImage,
        fandoms,
        hobbies,
        vibes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/78 p-4 backdrop-blur-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 38, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 26, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28 }}
            className="glass-panel my-8 w-full max-w-2xl rounded-[32px] p-5 sm:p-7 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan">Profile Customization</p>
                <h2 className="mt-1 font-display text-3xl font-bold text-white">Refine your resonance</h2>
              </div>
              <button
                onClick={onClose}
                className="focus-ring grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-white hover:bg-white/12 transition"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Profile Image & Identification */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative size-20 rounded-2xl overflow-hidden border border-white/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profileImage || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80"} alt="" className="size-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-white/55">Avatar Image URL</label>
                  <input
                    value={profileImage}
                    onChange={e => setProfileImage(e.target.value)}
                    className="focus-ring h-11 w-full rounded-xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/35"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Username & Handle */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-white/55">Display Alias</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="focus-ring h-11 w-full rounded-xl border border-white/12 bg-white/8 px-4 text-sm text-white"
                    placeholder="e.g. Mira Vale"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-white/55">Unique Handle</label>
                  <input
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    className="focus-ring h-11 w-full rounded-xl border border-white/12 bg-white/8 px-4 text-sm text-white"
                    placeholder="e.g. miravibe"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-white/55">Self Narrative (Bio)</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="focus-ring w-full resize-none rounded-xl border border-white/12 bg-white/8 p-4 text-sm leading-6 text-white"
                  placeholder="Tell the city how you see the weather..."
                />
              </div>

              {/* Select Tags: Fandoms */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/70">Fandom Connections</h3>
                <div className="flex flex-wrap gap-2">
                  {allFandoms.map(item => {
                    const active = fandoms.includes(item);
                    return (
                      <Tag
                        key={item}
                        tone="violet"
                        selected={active}
                        onClick={() => toggleFandom(item)}
                      >
                        {item}
                      </Tag>
                    );
                  })}
                </div>
              </div>

              {/* Select Tags: Hobbies */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/70">Routine Rituals (Hobbies)</h3>
                <div className="flex flex-wrap gap-2">
                  {allHobbies.map(item => {
                    const active = hobbies.includes(item);
                    return (
                      <Tag
                        key={item}
                        tone="cyan"
                        selected={active}
                        onClick={() => toggleHobby(item)}
                      >
                        {item}
                      </Tag>
                    );
                  })}
                </div>
              </div>

              {/* Select Tags: Vibes */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/70">Aesthetic Vibes</h3>
                <div className="flex flex-wrap gap-2">
                  {allVibes.map(item => {
                    const active = vibes.includes(item);
                    return (
                      <Tag
                        key={item}
                        tone="pink"
                        selected={active}
                        onClick={() => toggleVibe(item)}
                      >
                        {item}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-5">
              <button
                onClick={onClose}
                disabled={saving}
                className="glass-button focus-ring rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !username.trim() || !handle.trim()}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet via-neon to-peach px-6 py-3 text-sm font-extrabold text-white shadow-pink disabled:opacity-50"
              >
                {saving ? "Resonating..." : (
                  <>
                    <Sparkles className="size-4" />
                    Save Passport
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
