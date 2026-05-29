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

// 2. Hook for loading and managing the Feed with Realtime updates & Pagination
export function useFeed(spaceId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      const targetPage = reset ? 1 : page;
      const data = await dbClient.getPosts(spaceId, targetPage, 10);
      
      if (reset) {
        setPosts(data);
        setPage(2);
        setHasMore(data.length === 10);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setPage(prev => prev + 1);
        setHasMore(data.length === 10);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [spaceId, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(false);
    }
  };

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
    fetchFeed(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("feed-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          () => {
            fetchFeed(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [spaceId]);

  return { posts, loading, error, addPost, refreshFeed: () => fetchFeed(true), loadMore, hasMore };
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
      if (!currentId) {
        setLiked(false);
        setSaved(false);
        return;
      }
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
      loadFollowStats();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFollowStats();
  }, [targetUserId, loadFollowStats]);

  return { following, followers, followingList, toggleFollow, loadFollowStats, loading };
}

// 5. Hook for Alerts / Signals Hub with Realtime support (listening to notifications)
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
      const channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
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
    }, 300);

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

// 10. Hook for Space Membership Join/Leave [NEW]
export function useSpaceMembership(spaceId: string) {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkMembership = useCallback(async () => {
    if (!spaceId) return;
    try {
      setLoading(true);
      const status = await dbClient.isSpaceMember(spaceId);
      setIsMember(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  const joinSpace = async () => {
    try {
      const success = await dbClient.joinSpace(spaceId);
      if (success) setIsMember(true);
      return success;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const leaveSpace = async () => {
    try {
      const success = await dbClient.leaveSpace(spaceId);
      if (success) setIsMember(false);
      return success;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    checkMembership();
  }, [spaceId, checkMembership]);

  return { isMember, loading, joinSpace, leaveSpace, refreshMembership: checkMembership };
}
