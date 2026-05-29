"use client";

import { useState, useEffect, useCallback } from "react";
import { dbClient } from "@/lib/db-client";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { UserProfile, Post, Comment, Space } from "@/types/app";

// 1. Hook for handling Authentication & Current User Profiles
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await dbClient.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load auth user");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const updated = await dbClient.updateProfile(user.id, updates);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refreshProfile: fetchUser, updateProfile };
}

// 2. Hook for loading and managing the Feed with Realtime updates
export function useFeed(spaceId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbClient.getPosts(spaceId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  const addPost = async (post: Pick<Post, "content" | "imageUrl" | "spaceId" | "moodTag" | "musicLink">) => {
    try {
      const newPost = await dbClient.createPost(post);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      throw err;
    }
  };

  useEffect(() => {
    fetchFeed();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("feed-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          () => {
            fetchFeed();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [spaceId, fetchFeed]);

  return { posts, loading, error, addPost, refreshFeed: fetchFeed };
}

// 3. Hook for interacting with a single Post (likes, saves, comments)
export function usePostActions(post: Post) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loading, setLoading] = useState(true);

  const fetchStates = useCallback(async () => {
    try {
      const currentId = await dbClient.getCurrentUserId();
      const isL = await dbClient.isPostLiked(post.id, currentId);
      const isS = await dbClient.isPostSaved(post.id, currentId);
      setLiked(isL);
      setSaved(isS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [post.id]);

  const toggleLike = async () => {
    try {
      const isL = await dbClient.toggleLike(post.id);
      setLiked(isL);
      setLikeCount(prev => prev + (isL ? 1 : -1));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSave = async () => {
    try {
      const isS = await dbClient.toggleSavePost(post.id);
      setSaved(isS);
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (content: string) => {
    try {
      const newComment = await dbClient.addComment(post.id, content);
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    setComments(post.comments || []);
    setLikeCount(post.likes);
    fetchStates();
  }, [post, fetchStates]);

  return { liked, saved, likeCount, comments, toggleLike, toggleSave, addComment, loading };
}

// 4. Hook for loading and setting up Follower relationships
export function useFollow(targetUserId?: string) {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFollowStats = useCallback(async () => {
    if (!targetUserId) return;
    try {
      setLoading(true);
      const isF = await dbClient.isFollowing(targetUserId);
      const fers = await dbClient.getFollowers(targetUserId);
      const fing = await dbClient.getFollowing(targetUserId);
      setFollowing(isF);
      setFollowers(fers);
      setFollowingList(fing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const toggleFollow = async () => {
    if (!targetUserId) return;
    try {
      const isF = await dbClient.toggleFollow(targetUserId);
      setFollowing(isF);
      loadFollowStats(); // Refresh lists
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFollowStats();
  }, [targetUserId, loadFollowStats]);

  return { following, followers, followingList, toggleFollow, loadFollowStats, loading };
}

// 5. Hook for Alerts / Signals Hub with Realtime support
export function useSignals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      const list = await dbClient.getSignals();
      setSignals(list);
      setUnreadCount(list.filter(s => !s.isRead).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (signalId: string) => {
    try {
      await dbClient.markSignalAsRead(signalId);
      setSignals(prev =>
        prev.map(s => (s.id === signalId ? { ...s, isRead: true } : s))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSignals();

    if (isSupabaseConfigured && supabase) {
      // Realtime push
      const channel = supabase
        .channel("signals-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "signals" },
          () => {
            fetchSignals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchSignals]);

  return { signals, unreadCount, markAsRead, refreshSignals: fetchSignals, loading };
}

// 6. Hook for checking Vibe Matches
export function useMatches(userId?: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await dbClient.getVibeMatches(userId);
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMatches();
  }, [userId, fetchMatches]);

  return { matches, loading, refreshMatches: fetchMatches };
}

// 7. Hook for Search System
export function useSearch(query: string) {
  const [results, setResults] = useState<{ users: UserProfile[]; spaces: any[]; tags: string[]; posts: Post[] }>({
    users: [],
    spaces: [],
    tags: [],
    posts: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ users: [], spaces: [], tags: [], posts: [] });
        return;
      }
      try {
        setLoading(true);
        const data = await dbClient.searchAll(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return { results, loading };
}

// 8. Hook for Admin Analytics Dashboard
export function useAdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbClient.getAdminAnalytics();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refreshStats: fetchStats };
}

// 9. Hook for loading Spaces dynamically
export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbClient.getSpaces();
      setSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  return { spaces, loading, error, refreshSpaces: fetchSpaces };
}
