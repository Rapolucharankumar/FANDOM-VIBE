export type VibeTag =
  | "Soft Life"
  | "Midnight Energy"
  | "Dark Academia"
  | "Cozy Cafe"
  | "Dreamcore"
  | "Streetwear"
  | "Film Aesthetic"
  | "Minimal";

export type Fandom =
  | "BTS"
  | "BLACKPINK"
  | "TXT"
  | "Stray Kids"
  | "EXO"
  | "NewJeans";

export type Hobby =
  | "Photography"
  | "Gaming"
  | "Fashion"
  | "Coding"
  | "Gym"
  | "Anime"
  | "Music Production"
  | "Art"
  | "Reading"
  | "Journaling";

export type Space = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  vibe: VibeTag;
  members: number;
  liveNow: number;
};

export type UserProfile = {
  id: string;
  username: string;
  handle: string;
  bio: string;
  profileImage: string;
  fandoms: Fandom[];
  hobbies: Hobby[];
  vibes: VibeTag[];
  badges: string[];
};

export type Comment = {
  id: string;
  user: Pick<UserProfile, "username" | "profileImage" | "handle">;
  content: string;
  createdAt: string;
};

export type Post = {
  id: string;
  user: UserProfile;
  content: string;
  imageUrl?: string;
  spaceId: string;
  moodTag: VibeTag;
  musicLink?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
};

export type SpaceMessage = {
  id: string;
  spaceId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: Pick<UserProfile, "username" | "profileImage" | "handle">;
};
