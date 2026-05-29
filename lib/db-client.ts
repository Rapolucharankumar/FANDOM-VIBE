/* eslint-disable @typescript-eslint/no-explicit-any */
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { currentUser as mockCurrentUser, people as mockPeople, posts as mockPosts, spaces as mockSpaces } from "@/lib/mock-data";
import type { UserProfile, Post, Comment, Space, VibeTag, Fandom, Hobby } from "@/types/app";

// LocalStorage key constants (only used in offline demo mode)
const KEYS = {
  USERS: "fandom-vibe-users",
  POSTS: "fandom-vibe-posts",
  LIKES: "fandom-vibe-likes",
  FOLLOWS: "fandom-vibe-follows",
  SAVED_POSTS: "fandom-vibe-saved-posts",
  SIGNALS: "fandom-vibe-signals",
  CURRENT_USER_ID: "fandom-vibe-current-user-id"
};

// Local storage helpers
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const value = window.localStorage.getItem(key);
  if (!value) {
    window.localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

// Initialise Local Storage DB with Mock Data if empty
export function initLocalDB() {
  if (typeof window === "undefined") return;

  if (!window.localStorage.getItem(KEYS.USERS)) {
    window.localStorage.setItem(KEYS.USERS, JSON.stringify(mockPeople));
  }
  if (!window.localStorage.getItem(KEYS.POSTS)) {
    const localPosts = mockPosts.map(p => ({
      id: p.id,
      user_id: p.user.id,
      content: p.content,
      image_url: p.imageUrl,
      space_id: p.spaceId,
      mood_tag: p.moodTag,
      music_link: p.musicLink,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }));
    window.localStorage.setItem(KEYS.POSTS, JSON.stringify(localPosts));
  }
  if (!window.localStorage.getItem(KEYS.LIKES)) {
    const initialLikes = mockPosts.map(p => ({
      user_id: "user-002",
      post_id: p.id
    }));
    window.localStorage.setItem(KEYS.LIKES, JSON.stringify(initialLikes));
  }
  if (!window.localStorage.getItem(KEYS.FOLLOWS)) {
    const initialFollows = [
      { follower_id: "user-001", following_id: "user-002" },
      { follower_id: "user-001", following_id: "user-003" },
      { follower_id: "user-002", following_id: "user-001" }
    ];
    window.localStorage.setItem(KEYS.FOLLOWS, JSON.stringify(initialFollows));
  }
  if (!window.localStorage.getItem(KEYS.SAVED_POSTS)) {
    window.localStorage.setItem(KEYS.SAVED_POSTS, JSON.stringify([]));
  }
  if (!window.localStorage.getItem(KEYS.SIGNALS)) {
    const initialSignals = [
      {
        id: "sig-001",
        receiver_id: "user-001",
        sender_id: "user-003",
        type: "like",
        title: "Sana Bloom liked your post",
        body: "Shared a new visual mood.",
        link: "/profile",
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
      },
      {
        id: "sig-002",
        receiver_id: "user-001",
        sender_id: "user-002",
        type: "comment",
        title: "Juno Park replied: This belongs on the landing page of my brain.",
        body: "There is a specific kind of belonging...",
        link: "/home",
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ];
    window.localStorage.setItem(KEYS.SIGNALS, JSON.stringify(initialSignals));
  }
  if (!window.localStorage.getItem("fandom-vibe-spaces")) {
    window.localStorage.setItem("fandom-vibe-spaces", JSON.stringify(mockSpaces));
  }
  if (!window.localStorage.getItem(KEYS.CURRENT_USER_ID)) {
    window.localStorage.setItem(KEYS.CURRENT_USER_ID, "user-001");
  }
}

const isUUID = (val: any): boolean => {
  if (typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

// Helper to translate database profiles to client-side UserProfile types
function mapProfile(p: any): UserProfile {
  if (!p) {
    return {
      id: "unknown",
      username: "Dreamer",
      handle: "dreamer",
      profileImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80",
      bio: "A mysterious dreamer.",
      fandoms: [],
      hobbies: [],
      vibes: [],
      badges: ["Explorer"]
    };
  }
  return {
    id: p.id,
    username: p.display_name || p.username || "Dreamer",
    handle: p.username || "dreamer",
    profileImage: p.avatar_url || "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80",
    bio: p.bio || "",
    fandoms: (p.fandoms as Fandom[]) || [],
    hobbies: (p.hobbies as Hobby[]) || [],
    vibes: (p.aesthetics as VibeTag[]) || [],
    badges: p.badges || ["Explorer"]
  };
}

// ----------------------------------------------------
// Unified DB Interface Implementation
// ----------------------------------------------------
export const dbClient = {
  // --- FILE UPLOADS (Supabase Storage) ---
  async uploadFile(bucket: string, file: File): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured.");
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized to upload files.");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // --- AUTH & PROFILE ---
  async getCurrentUserId(): Promise<string | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    }
    initLocalDB();
    return getLocal<string>(KEYS.CURRENT_USER_ID, "user-001");
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) return null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentId)
        .maybeSingle();
      
      if (!error && data) {
        return mapProfile(data);
      } else {
        // Self-healing: if auth user exists but public profile row is missing
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && authUser.id === currentId) {
          const fallbackUsername = authUser.user_metadata?.username || authUser.email?.split("@")[0] || "Dreamer";
          const fallbackHandle = (fallbackUsername.toLowerCase().replace(/\s/g, "") + "_" + authUser.id.substring(0, 4)).slice(0, 20);
          
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentId,
              username: fallbackHandle,
              display_name: fallbackUsername,
              avatar_url: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80",
              bio: "Creative explorer. Searching for late night vibes and aesthetic connections."
            })
            .select()
            .single();
            
          if (!insertError && newProfile) {
            return mapProfile(newProfile);
          }
        }
      }
      return null;
    }

    // Fallback LocalStorage
    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    const demoAuth = getLocal<{ email: string, username: string } | null>("fandom-vibe-demo-user", null);
    const onboardingData = getLocal<Record<string, string[]> | null>("fandom-vibe-onboarding", null);

    let profile = users.find(u => u.id === currentId);
    if (!profile && demoAuth) {
      profile = {
        id: currentId,
        username: demoAuth.username,
        handle: demoAuth.username.toLowerCase().replace(/\s/g, ""),
        bio: "Creative explorer. Searching for late night vibes and aesthetic connections.",
        profileImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80",
        fandoms: (onboardingData?.Fandoms as Fandom[]) || [],
        hobbies: (onboardingData?.Hobbies as Hobby[]) || [],
        vibes: (onboardingData?.Vibes as VibeTag[]) || [],
        badges: ["New Member", "Dreamer"]
      };
      users.push(profile);
      setLocal(KEYS.USERS, users);
    }
    return profile || mockCurrentUser;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        return mapProfile(data);
      }
      return null;
    }
    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    return users.find(u => u.id === userId) || null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: Record<string, any> = {};
      if (updates.username) dbUpdates.display_name = updates.username;
      if (updates.handle) dbUpdates.username = updates.handle;
      if (updates.bio) dbUpdates.bio = updates.bio;
      if (updates.profileImage) dbUpdates.avatar_url = updates.profileImage;
      if (updates.fandoms) dbUpdates.fandoms = updates.fandoms;
      if (updates.hobbies) dbUpdates.hobbies = updates.hobbies;
      if (updates.vibes) dbUpdates.aesthetics = updates.vibes;

      const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId)
        .select()
        .single();
      
      if (error) throw error;
      return mapProfile(data);
    }

    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User profile not found");
    const updated = { ...users[index], ...updates };
    users[index] = updated;
    setLocal(KEYS.USERS, users);
    return updated;
  },

  // --- POSTS ---
  async getPosts(spaceId?: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("posts")
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*),
          comments(
            *,
            user:profiles!comments_user_id_fkey(*)
          ),
          likes(user_id)
        `)
        .order("created_at", { ascending: false });

      if (spaceId && spaceId !== "all" && isUUID(spaceId)) {
        query = query.eq("space_id", spaceId);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        content: p.content || "",
        imageUrl: p.image_url,
        spaceId: p.space_id,
        moodTag: p.mood_tag as VibeTag,
        musicLink: p.music_link,
        createdAt: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes ? p.likes.length : 0,
        user: mapProfile(p.user),
        comments: (p.comments || []).map((c: any) => ({
          id: c.id,
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleDateString(),
          user: {
            username: c.user?.display_name || "Anonymous",
            handle: c.user?.username || "anonymous",
            profileImage: c.user?.avatar_url || ""
          }
        }))
      }));
    }

    // Local Storage Mock Mode
    initLocalDB();
    const localPosts = getLocal<any[]>(KEYS.POSTS, []);
    const localLikes = getLocal<any[]>(KEYS.LIKES, []);
    const localUsers = getLocal<UserProfile[]>(KEYS.USERS, []);
    let resolvedPosts: Post[] = localPosts.map(p => {
      const author = localUsers.find(u => u.id === p.user_id) || mockCurrentUser;
      const likesCount = localLikes.filter(l => l.post_id === p.id).length;
      return {
        id: p.id,
        content: p.content,
        imageUrl: p.image_url,
        spaceId: p.space_id,
        moodTag: p.mood_tag,
        musicLink: p.music_link,
        createdAt: "recently",
        likes: likesCount,
        comments: [],
        user: author
      };
    });

    if (spaceId && spaceId !== "all") {
      resolvedPosts = resolvedPosts.filter(p => p.spaceId === spaceId);
    }
    // Simple pagination mock
    return resolvedPosts.reverse().slice((page - 1) * limit, page * limit);
  },

  async createPost(post: Pick<Post, "content" | "imageUrl" | "spaceId" | "moodTag" | "musicLink">): Promise<Post> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("User must be logged in to create a post.");

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: currentId,
          content: post.content,
          image_url: post.imageUrl || null,
          space_id: (post.spaceId && isUUID(post.spaceId)) ? post.spaceId : null,
          mood_tag: post.moodTag,
          music_link: post.musicLink || null
        })
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;

      // Create a notification for other matching vibe profiles (Feature 3 vibe matches notification)
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const vibeMatches = await this.getVibeMatches(currentId);
        for (const match of vibeMatches) {
          if (match.percentage >= 80 && match.profile.vibes.includes(post.moodTag)) {
            await this.createSignal(
              match.profile.id,
              "space_activity",
              `${currentUser.username} shared a post matching your ${post.moodTag} vibe: "${post.content.slice(0, 30)}..."`
            );
          }
        }
      }

      return {
        id: data.id,
        content: data.content,
        imageUrl: data.image_url,
        spaceId: data.space_id,
        moodTag: data.mood_tag as VibeTag,
        musicLink: data.music_link,
        createdAt: "now",
        likes: 0,
        comments: [],
        user: mapProfile(data.user)
      };
    }

    initLocalDB();
    const localPosts = getLocal<any[]>(KEYS.POSTS, []);
    const newPostRaw = {
      id: `post-${Date.now()}`,
      user_id: currentId,
      content: post.content,
      image_url: post.imageUrl,
      space_id: post.spaceId,
      mood_tag: post.moodTag,
      music_link: post.musicLink,
      created_at: new Date().toISOString()
    };
    localPosts.push(newPostRaw);
    setLocal(KEYS.POSTS, localPosts);

    const me = await this.getCurrentUser();
    return {
      id: newPostRaw.id,
      content: newPostRaw.content,
      imageUrl: newPostRaw.image_url,
      spaceId: newPostRaw.space_id,
      moodTag: newPostRaw.mood_tag,
      musicLink: newPostRaw.music_link,
      createdAt: "now",
      likes: 0,
      comments: [],
      user: me!
    };
  },

  // --- SPACES ---
  async getSpaces(): Promise<Space[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;

      const spacesData = data || [];

      // Self-healing database seeding: if spaces table returns empty, seed default spaces from client-side!
      if (spacesData.length === 0) {
        const defaultSpaces = mockSpaces.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          cover_image: s.coverImage,
          vibe: s.vibe
        }));

        const { data: seededData, error: seedError } = await supabase
          .from("spaces")
          .insert(defaultSpaces)
          .select();
        
        if (!seedError && seededData && seededData.length > 0) {
          return seededData.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            coverImage: s.cover_image || "",
            vibe: (s.vibe || "Minimal") as VibeTag,
            members: "10k",
            liveNow: 120
          }));
        }

        return mockSpaces;
      }

      return spacesData.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        coverImage: s.cover_image || "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=80",
        vibe: (s.vibe || "Minimal") as VibeTag,
        members: "10k", // Hardcoded indicators preserved for visual layouts
        liveNow: 120
      }));
    }
    initLocalDB();
    return getLocal<Space[]>("fandom-vibe-spaces", mockSpaces);
  },

  // --- SPACE MEMBERSHIP (Join/Leave) ---
  async joinSpace(spaceId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("Must be logged in to join spaces.");
    if (!spaceId || !isUUID(spaceId)) return false;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("space_members")
        .insert({ space_id: spaceId, user_id: currentId });
      if (error) throw error;

      // Log space activity notification
      const space = (await this.getSpaces()).find(s => s.id === spaceId);
      const user = await this.getCurrentUser();
      if (space && user) {
        await this.createSignal(
          currentId,
          "space_activity",
          `You joined the ${space.name} space. Let's vibing!`
        );
      }
      return true;
    }
    return true;
  },

  async leaveSpace(spaceId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("Must be logged in to leave spaces.");
    if (!spaceId || !isUUID(spaceId)) return false;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("space_members")
        .delete()
        .eq("space_id", spaceId)
        .eq("user_id", currentId);
      if (error) throw error;
      return true;
    }
    return true;
  },

  async isSpaceMember(spaceId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) return false;
    if (!spaceId || !isUUID(spaceId)) return false;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("space_members")
        .select("space_id")
        .eq("space_id", spaceId)
        .eq("user_id", currentId)
        .maybeSingle();
      return !error && !!data;
    }
    return true;
  },

  // --- LIKES ---
  async toggleLike(postId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("Must be logged in to like posts.");

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", currentId)
        .eq("post_id", postId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("likes").delete().eq("id", existing.id);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("likes").insert({ user_id: currentId, post_id: postId });
        if (error) throw error;
        
        // Trigger alert notification to author
        const { data: post } = await supabase
          .from("posts")
          .select("user_id, content")
          .eq("id", postId)
          .single();

        if (post && post.user_id !== currentId) {
          const me = await this.getCurrentUser();
          if (me) {
            await this.createSignal(
              post.user_id,
              "like",
              `${me.username} liked your post: "${post.content ? post.content.slice(0, 30) : 'Image'}"`
            );
          }
        }
        return true;
      }
    }

    initLocalDB();
    const likes = getLocal<any[]>(KEYS.LIKES, []);
    const index = likes.findIndex(l => l.user_id === currentId && l.post_id === postId);
    if (index > -1) {
      likes.splice(index, 1);
      setLocal(KEYS.LIKES, likes);
      return false;
    } else {
      likes.push({ user_id: currentId, post_id: postId });
      setLocal(KEYS.LIKES, likes);
      return true;
    }
  },

  async isPostLiked(postId: string, currentUserId?: string): Promise<boolean> {
    const currentId = currentUserId || await this.getCurrentUserId();
    if (!currentId) return false;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", currentId)
        .eq("post_id", postId)
        .maybeSingle();
      return !error && !!data;
    }
    initLocalDB();
    const likes = getLocal<any[]>(KEYS.LIKES, []);
    return likes.some(l => l.user_id === currentId && l.post_id === postId);
  },

  // --- COMMENTS ---
  async addComment(postId: string, content: string): Promise<Comment> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("Must be logged in to comment.");
    const me = await this.getCurrentUser();
    if (!me) throw new Error("Profile not loaded.");
    
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentId,
          content
        })
        .select()
        .single();
      
      if (error) throw error;

      // Trigger comment notification to author
      const { data: post } = await supabase
        .from("posts")
        .select("user_id, content")
        .eq("id", postId)
        .single();

      if (post && post.user_id !== currentId) {
        await this.createSignal(
          post.user_id,
          "comment",
          `${me.username} commented: "${content.slice(0, 30)}..." on your post.`
        );
      }

      return {
        id: data.id,
        content: data.content,
        createdAt: "now",
        user: {
          username: me.username,
          handle: me.handle,
          profileImage: me.profileImage
        }
      };
    }

    initLocalDB();
    return {
      id: `comment-${Date.now()}`,
      content,
      createdAt: "now",
      user: {
        username: me.username,
        handle: me.handle,
        profileImage: me.profileImage
      }
    };
  },

  // --- SAVED POSTS ---
  async toggleSavePost(postId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) throw new Error("Must be logged in to save posts.");

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", currentId)
        .eq("post_id", postId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("saved_posts").delete().eq("user_id", currentId).eq("post_id", postId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("saved_posts").insert({ user_id: currentId, post_id: postId });
        if (error) throw error;
        return true;
      }
    }

    initLocalDB();
    const saved = getLocal<any[]>(KEYS.SAVED_POSTS, []);
    const index = saved.findIndex(s => s.user_id === currentId && s.post_id === postId);
    if (index > -1) {
      saved.splice(index, 1);
      setLocal(KEYS.SAVED_POSTS, saved);
      return false;
    } else {
      saved.push({ user_id: currentId, post_id: postId });
      setLocal(KEYS.SAVED_POSTS, saved);
      return true;
    }
  },

  async isPostSaved(postId: string, currentUserId?: string): Promise<boolean> {
    const currentId = currentUserId || await this.getCurrentUserId();
    if (!currentId) return false;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", currentId)
        .eq("post_id", postId)
        .maybeSingle();
      return !error && !!data;
    }
    initLocalDB();
    const saved = getLocal<any[]>(KEYS.SAVED_POSTS, []);
    return saved.some(s => s.user_id === currentId && s.post_id === postId);
  },

  async getSavedPosts(): Promise<Post[]> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("saved_posts")
        .select(`
          post:posts(
            *,
            user:profiles!posts_user_id_fkey(*),
            comments(
              *,
              user:profiles!comments_user_id_fkey(*)
            ),
            likes(user_id)
          )
        `)
        .eq("user_id", currentId);

      if (error) throw error;

      return (data || []).map((row: any) => {
        const p = row.post;
        if (!p) return null;
        return {
          id: p.id,
          content: p.content || "",
          imageUrl: p.image_url,
          spaceId: p.space_id,
          moodTag: p.mood_tag as VibeTag,
          musicLink: p.music_link,
          createdAt: new Date(p.created_at).toLocaleDateString(),
          likes: p.likes ? p.likes.length : 0,
          user: mapProfile(p.user),
          comments: (p.comments || []).map((c: any) => ({
            id: c.id,
            content: c.content,
            createdAt: new Date(c.created_at).toLocaleDateString(),
            user: {
              username: c.user?.display_name || "Anonymous",
              handle: c.user?.username || "anonymous",
              profileImage: c.user?.avatar_url || ""
            }
          }))
        };
      }).filter(Boolean) as Post[];
    }

    initLocalDB();
    const saved = getLocal<any[]>(KEYS.SAVED_POSTS, []);
    const userSaved = saved.filter(s => s.user_id === currentId).map(s => s.post_id);
    const allPosts = await this.getPosts();
    return allPosts.filter(p => userSaved.includes(p.id));
  },

  // --- FOLLOWS ---
  async toggleFollow(targetUserId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId || currentId === targetUserId) return false;

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", currentId)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("follows").delete().eq("follower_id", currentId).eq("following_id", targetUserId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("follows").insert({ follower_id: currentId, following_id: targetUserId });
        if (error) throw error;
        
        // Signal follow alert
        const me = await this.getCurrentUser();
        if (me) {
          await this.createSignal(
            targetUserId,
            "follow",
            `${me.username} followed you. Check out their resonance overlaps!`
          );
        }
        return true;
      }
    }

    initLocalDB();
    const follows = getLocal<any[]>(KEYS.FOLLOWS, []);
    const index = follows.findIndex(f => f.follower_id === currentId && f.following_id === targetUserId);
    if (index > -1) {
      follows.splice(index, 1);
      setLocal(KEYS.FOLLOWS, follows);
      return false;
    } else {
      follows.push({ follower_id: currentId, following_id: targetUserId });
      setLocal(KEYS.FOLLOWS, follows);
      return true;
    }
  },

  async isFollowing(targetUserId: string): Promise<boolean> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) return false;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", currentId)
        .eq("following_id", targetUserId)
        .maybeSingle();
      return !error && !!data;
    }
    initLocalDB();
    const follows = getLocal<any[]>(KEYS.FOLLOWS, []);
    return follows.some(f => f.follower_id === currentId && f.following_id === targetUserId);
  },

  async getFollowers(userId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower:profiles!follows_follower_id_fkey(*)
        `)
        .eq("following_id", userId);

      if (error) throw error;

      return (data || []).map((row: any) => mapProfile(row.follower));
    }

    initLocalDB();
    const follows = getLocal<any[]>(KEYS.FOLLOWS, []);
    const followerIds = follows.filter(f => f.following_id === userId).map(f => f.follower_id);
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    return users.filter(u => followerIds.includes(u.id));
  },

  async getFollowing(userId: string): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          following:profiles!follows_following_id_fkey(*)
        `)
        .eq("follower_id", userId);

      if (error) throw error;

      return (data || []).map((row: any) => mapProfile(row.following));
    }

    initLocalDB();
    const follows = getLocal<any[]>(KEYS.FOLLOWS, []);
    const followingIds = follows.filter(f => f.follower_id === userId).map(f => f.following_id);
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    return users.filter(u => followingIds.includes(u.id));
  },

  // --- NOTIFICATIONS [signals] ---
  async getSignals(): Promise<any[]> {
    const currentId = await this.getCurrentUserId();
    if (!currentId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        type: s.type,
        title: s.type === "like" ? "Post Liked" : s.type === "comment" ? "New Comment" : s.type === "follow" ? "New Follower" : "Space Alert",
        body: s.content,
        link: s.type === "follow" ? "/profile" : "/home",
        isRead: s.read,
        createdAt: new Date(s.created_at).toLocaleTimeString() + " - " + new Date(s.created_at).toLocaleDateString()
      }));
    }

    initLocalDB();
    const signals = getLocal<any[]>(KEYS.SIGNALS, []);
    return signals
      .filter(s => s.receiver_id === currentId)
      .map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        body: s.body || "",
        link: s.link || "/home",
        isRead: s.is_read,
        createdAt: "recently"
      }))
      .reverse();
  },

  async markSignalAsRead(signalId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", signalId);
      if (error) throw error;
      return;
    }
    initLocalDB();
    const signals = getLocal<any[]>(KEYS.SIGNALS, []);
    const idx = signals.findIndex(s => s.id === signalId);
    if (idx > -1) {
      signals[idx].is_read = true;
      setLocal(KEYS.SIGNALS, signals);
    }
  },

  async createSignal(
    receiverId: string,
    type: string,
    content: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: receiverId,
          type,
          content
        });
      if (error) throw error;
      return;
    }
    initLocalDB();
    const signals = getLocal<any[]>(KEYS.SIGNALS, []);
    signals.push({
      id: `sig-${Date.now()}`,
      receiver_id: receiverId,
      sender_id: "system",
      type,
      title: type,
      body: content,
      link: "/home",
      is_read: false,
      created_at: new Date().toISOString()
    });
    setLocal(KEYS.SIGNALS, signals);
  },

  // --- VIBE MATCH SYSTEM ---
  async getVibeMatches(userId: string): Promise<{ profile: UserProfile; percentage: number; sharedFandoms: string[]; sharedHobbies: string[]; sharedVibes: string[] }[]> {
    const user = await this.getUserProfile(userId);
    if (!user) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("vibe_matches")
        .select(`
          *,
          user1:profiles!vibe_matches_user_id_1_fkey(*),
          user2:profiles!vibe_matches_user_id_2_fkey(*)
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

      if (error) throw error;

      return (data || []).map((row: any) => {
        const isUser1 = row.user_id_1 === userId;
        const counterpart = isUser1 ? row.user2 : row.user1;
        return {
          profile: mapProfile(counterpart),
          percentage: row.match_percentage,
          sharedFandoms: row.shared_fandoms || [],
          sharedHobbies: row.shared_hobbies || [],
          sharedVibes: row.shared_aesthetics || []
        };
      }).sort((a, b) => b.percentage - a.percentage);
    }

    // Client-side calculations (Dual-Mode Fallback)
    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    const self = users.find(u => u.id === userId) || mockCurrentUser;
    return users
      .filter(u => u.id !== userId)
      .map(other => {
        const match = this.calculateVibeMatchLocal(self, other);
        return {
          profile: other,
          percentage: match.percentage,
          sharedFandoms: match.sharedFandoms,
          sharedHobbies: match.sharedHobbies,
          sharedVibes: match.sharedVibes
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  },

  calculateVibeMatchLocal(self: UserProfile, other: UserProfile) {
    const f1 = self.fandoms || [];
    const f2 = other.fandoms || [];
    const h1 = self.hobbies || [];
    const h2 = other.hobbies || [];
    const v1 = self.vibes || [];
    const v2 = other.vibes || [];

    const intersection = (a: any[], b: any[]) => a.filter(x => b.includes(x));
    const union = (a: any[], b: any[]) => Array.from(new Set([...a, ...b]));

    const sharedFandoms = intersection(f1, f2);
    const sharedHobbies = intersection(h1, h2);
    const sharedVibes = intersection(v1, v2);

    const jaccard = (a: any[], b: any[]) => {
      const u = union(a, b);
      return u.length > 0 ? intersection(a, b).length / u.length : 0;
    };

    const jaccardF = jaccard(f1, f2);
    const jaccardH = jaccard(h1, h2);
    const jaccardV = jaccard(v1, v2);

    const percentage = Math.round((jaccardV * 45) + (jaccardH * 35) + (jaccardF * 20));

    return {
      percentage,
      sharedFandoms,
      sharedHobbies,
      sharedVibes
    };
  },

  // --- SEARCH SYSTEM ---
  async searchAll(query: string): Promise<{ users: UserProfile[]; spaces: Space[]; tags: string[]; posts: Post[] }> {
    const q = query.toLowerCase().trim();
    if (!q) return { users: [], spaces: [], tags: [], posts: [] };

    // Fetch Spaces
    const spacesList = await this.getSpaces();
    const matchedSpaces = spacesList.filter(
      s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.vibe.toLowerCase().includes(q)
    );

    if (isSupabaseConfigured && supabase) {
      const { data: dbUsers, error: usersErr } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,bio.ilike.%${q}%`);

      const { data: dbPosts, error: postsErr } = await supabase
        .from("posts")
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*),
          comments(
            *,
            user:profiles!comments_user_id_fkey(*)
          ),
          likes(user_id)
        `)
        .or(`content.ilike.%${q}%,mood_tag.ilike.%${q}%`);

      if (usersErr) throw usersErr;
      if (postsErr) throw postsErr;

      const resolvedUsers = (dbUsers || []).map((u: any) => mapProfile(u));

      const resolvedPosts = (dbPosts || []).map((p: any) => ({
        id: p.id,
        content: p.content || "",
        imageUrl: p.image_url,
        spaceId: p.space_id,
        moodTag: p.mood_tag as VibeTag,
        musicLink: p.music_link,
        createdAt: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes ? p.likes.length : 0,
        user: mapProfile(p.user),
        comments: (p.comments || []).map((c: any) => ({
          id: c.id,
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleDateString(),
          user: {
            username: c.user?.display_name || "Anonymous",
            handle: c.user?.username || "anonymous",
            profileImage: c.user?.avatar_url || ""
          }
        }))
      }));

      const matchedTags: string[] = [];
      resolvedUsers.forEach(u => {
        u.fandoms.forEach(f => { if (f.toLowerCase().includes(q) && !matchedTags.includes(f)) matchedTags.push(f); });
        u.hobbies.forEach(h => { if (h.toLowerCase().includes(q) && !matchedTags.includes(h)) matchedTags.push(h); });
        u.vibes.forEach(v => { if (v.toLowerCase().includes(q) && !matchedTags.includes(v)) matchedTags.push(v); });
      });

      return {
        users: resolvedUsers,
        spaces: matchedSpaces,
        tags: matchedTags,
        posts: resolvedPosts
      };
    }

    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    const posts = await this.getPosts();

    const matchedUsers = users.filter(
      u => u.username.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)
    );
    const matchedPosts = posts.filter(
      p => p.content.toLowerCase().includes(q) || p.moodTag.toLowerCase().includes(q)
    );

    const matchedTags: string[] = [];
    users.forEach(u => {
      u.fandoms.forEach(f => { if (f.toLowerCase().includes(q) && !matchedTags.includes(f)) matchedTags.push(f); });
      u.hobbies.forEach(h => { if (h.toLowerCase().includes(q) && !matchedTags.includes(h)) matchedTags.push(h); });
      u.vibes.forEach(v => { if (v.toLowerCase().includes(q) && !matchedTags.includes(v)) matchedTags.push(v); });
    });

    return {
      users: matchedUsers,
      spaces: matchedSpaces,
      tags: matchedTags,
      posts: matchedPosts
    };
  },

  // --- ADMIN ANALYTICS ---
  async getAdminAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    trendingSpaces: { spaceName: string; count: number }[];
    topFandoms: { name: string; count: number }[];
    topHobbies: { name: string; count: number }[];
    engagementRate: number;
  }> {
    if (isSupabaseConfigured && supabase) {
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true });
      const { count: likesCount } = await supabase.from("likes").select("*", { count: "exact", head: true });
      const { count: commentsCount } = await supabase.from("comments").select("*", { count: "exact", head: true });

      const { data: allUsers } = await supabase.from("profiles").select("fandoms, hobbies");
      const { data: allPosts } = await supabase.from("posts").select("space_id");

      const fandomCounts: Record<string, number> = {};
      const hobbyCounts: Record<string, number> = {};
      (allUsers || []).forEach((u: any) => {
        (u.fandoms || []).forEach((f: string) => { fandomCounts[f] = (fandomCounts[f] || 0) + 1; });
        (u.hobbies || []).forEach((h: string) => { hobbyCounts[h] = (hobbyCounts[h] || 0) + 1; });
      });

      const spaceCounts: Record<string, number> = {};
      (allPosts || []).forEach((p: any) => {
        if (p.space_id) spaceCounts[p.space_id] = (spaceCounts[p.space_id] || 0) + 1;
      });

      const spacesList = await this.getSpaces();
      const trendingSpaces = Object.entries(spaceCounts).map(([sid, cnt]) => {
        const space = spacesList.find(s => s.id === sid);
        return { spaceName: space ? space.name : "Unknown Space", count: cnt };
      }).sort((a, b) => b.count - a.count).slice(0, 3);

      const topFandoms = Object.entries(fandomCounts)
        .map(([name, cnt]) => ({ name, count: cnt }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topHobbies = Object.entries(hobbyCounts)
        .map(([name, cnt]) => ({ name, count: cnt }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const totalU = userCount || 1;
      const totalP = postCount || 0;
      const totalL = likesCount || 0;
      const totalC = commentsCount || 0;
      const engagement = Math.round(((totalL + totalC + totalP) / totalU) * 10) / 10;

      return {
        totalUsers: totalU,
        activeUsers: Math.min(totalU, Math.max(1, Math.round(totalU * 0.72))),
        totalPosts: totalP,
        trendingSpaces,
        topFandoms,
        topHobbies,
        engagementRate: engagement
      };
    }

    initLocalDB();
    const users = getLocal<UserProfile[]>(KEYS.USERS, mockPeople);
    const posts = getLocal<any[]>(KEYS.POSTS, []);
    const likes = getLocal<any[]>(KEYS.LIKES, []);
    
    const fandomCounts: Record<string, number> = {};
    const hobbyCounts: Record<string, number> = {};
    users.forEach(u => {
      (u.fandoms || []).forEach(f => { fandomCounts[f] = (fandomCounts[f] || 0) + 1; });
      (u.hobbies || []).forEach(h => { hobbyCounts[h] = (hobbyCounts[h] || 0) + 1; });
    });

    const spaceCounts: Record<string, number> = {};
    posts.forEach(p => {
      spaceCounts[p.space_id] = (spaceCounts[p.space_id] || 0) + 1;
    });

    const trendingSpaces = Object.entries(spaceCounts).map(([sid, cnt]) => {
      const space = mockSpaces.find(s => s.id === sid);
      return { spaceName: space ? space.name : "Unknown Space", count: cnt };
    }).sort((a, b) => b.count - a.count).slice(0, 3);

    return {
      totalUsers: users.length,
      activeUsers: Math.round(users.length * 0.85),
      totalPosts: posts.length,
      trendingSpaces,
      topFandoms: Object.entries(fandomCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      topHobbies: Object.entries(hobbyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      engagementRate: Math.round(((posts.length + likes.length) / users.length) * 10) / 10
    };
  }
};
