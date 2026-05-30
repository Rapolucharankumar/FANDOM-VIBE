import type { Post, Space, UserProfile } from "@/types/app";

export const currentUser: UserProfile = {
  id: "user-001",
  username: "Mira Vale",
  handle: "miravibe",
  bio: "Soft futuristic scrapbook maker. Collecting songs, neon nights, cafe corners, and people who get the feeling.",
  profileImage:
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80",
  fandoms: ["BTS", "NewJeans", "Stray Kids"],
  hobbies: ["Photography", "Fashion", "Journaling", "Music Production"],
  vibes: ["Midnight Energy", "Cozy Cafe", "Film Aesthetic"],
  badges: ["First Light", "Moodboard Curator", "Cafe Regular"]
};

export const spaces: Space[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Midnight Thoughts",
    description: "Late-night notes, lyrical confessions, and soft chaos after 12.",
    coverImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    vibe: "Midnight Energy",
    members: 0,
    liveNow: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Cozy Cafe",
    description: "Warm drinks, reading corners, gentle playlists, and comfort posts.",
    coverImage:
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=80",
    vibe: "Cozy Cafe",
    members: 0,
    liveNow: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Fashion Room",
    description: "Idol airport looks, streetwear edits, thrift finds, and fit checks.",
    coverImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    vibe: "Streetwear",
    members: 0,
    liveNow: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Producer Space",
    description: "Beat snippets, desk setups, lyric drafts, and late-session energy.",
    coverImage:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    vibe: "Film Aesthetic",
    members: 0,
    liveNow: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Anime & K-Drama Club",
    description: "Watchlists, edits, emotional scenes, and comfort-character devotion.",
    coverImage:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
    vibe: "Dreamcore",
    members: 0,
    liveNow: 0
  }
];

export const people: UserProfile[] = [
  currentUser,
  {
    id: "user-002",
    username: "Juno Park",
    handle: "junopark",
    bio: "Producer, dancer, black hoodie loyalist.",
    profileImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    fandoms: ["BTS", "TXT"],
    hobbies: ["Music Production", "Coding", "Gym"],
    vibes: ["Midnight Energy", "Minimal"],
    badges: ["Loop Maker", "Night Shift"]
  },
  {
    id: "user-003",
    username: "Sana Bloom",
    handle: "sanabloom",
    bio: "Cafe diary, film roll, soft playlists.",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    fandoms: ["BLACKPINK", "NewJeans"],
    hobbies: ["Photography", "Reading", "Journaling"],
    vibes: ["Soft Life", "Cozy Cafe", "Film Aesthetic"],
    badges: ["Soft Lens", "Bookmarked"]
  },
  {
    id: "user-004",
    username: "Kai Denim",
    handle: "kaidenim",
    bio: "Streetwear boards, EXO edits, and thrift maps.",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    fandoms: ["EXO", "Stray Kids"],
    hobbies: ["Fashion", "Art", "Anime"],
    vibes: ["Streetwear", "Dark Academia"],
    badges: ["Fit Archivist", "Moodboard Curator"]
  }
];

export const posts: Post[] = [
  {
    id: "post-001",
    user: people[1],
    content:
      "Made a bassline that feels like walking home under violet streetlights after a concert. Saving it for the Producer Space listening thread.",
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    spaceId: "550e8400-e29b-41d4-a716-446655440004",
    moodTag: "Midnight Energy",
    musicLink: "https://open.spotify.com",
    createdAt: "12 min ago",
    likes: 284,
    comments: [
      {
        id: "comment-001",
        user: people[2],
        content: "That description already sounds like a chorus.",
        createdAt: "5 min ago"
      }
    ]
  },
  {
    id: "post-002",
    user: people[2],
    content:
      "Cafe corner checklist: iced latte, NewJeans playlist, one chapter finished, and a page of tiny emotional notes.",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    spaceId: "550e8400-e29b-41d4-a716-446655440002",
    moodTag: "Cozy Cafe",
    createdAt: "28 min ago",
    likes: 519,
    comments: [
      {
        id: "comment-002",
        user: people[0],
        content: "This is exactly the energy I wanted today.",
        createdAt: "11 min ago"
      },
      {
        id: "comment-003",
        user: people[3],
        content: "The playlist title better be dramatic.",
        createdAt: "7 min ago"
      }
    ]
  },
  {
    id: "post-003",
    user: people[3],
    content:
      "Airport-fit board for tomorrow: silver rings, structured jacket, soft bag, loud shoes. Idol-coded but still wearable.",
    imageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    spaceId: "550e8400-e29b-41d4-a716-446655440003",
    moodTag: "Streetwear",
    createdAt: "46 min ago",
    likes: 342,
    comments: []
  },
  {
    id: "post-004",
    user: people[0],
    content:
      "There is a specific kind of belonging that happens when someone understands both your favorite lyric and your favorite weather.",
    spaceId: "550e8400-e29b-41d4-a716-446655440001",
    moodTag: "Film Aesthetic",
    createdAt: "1 hr ago",
    likes: 811,
    comments: [
      {
        id: "comment-004",
        user: people[1],
        content: "This belongs on the landing page of my brain.",
        createdAt: "48 min ago"
      }
    ]
  }
];
