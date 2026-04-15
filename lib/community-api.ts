import { createClient } from "./supabase";

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  type: "question" | "vecu" | "conseil" | "soutien";
  content: string;
  week: number;
  created_at: string;
  reactions: Record<string, number>;
  reported?: boolean;
}

export interface PostReaction {
  post_id: string;
  user_id: string;
  emoji: string;
}

export async function fetchPosts(options: {
  week?: number;
  type?: string | null;
  page?: number;
  limit?: number;
}): Promise<{ posts: CommunityPost[]; hasMore: boolean }> {
  const supabase = createClient();
  const { week, type, page = 0, limit = 20 } = options;
  const from = page * limit;
  const to = from + limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("community_posts")
    .select("*")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (week) query = query.eq("week", week);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;

  return {
    posts: (data ?? []) as CommunityPost[],
    hasMore: (data?.length ?? 0) > limit,
  };
}

export async function createPost(post: {
  author_id: string;
  author_name: string;
  type: string;
  content: string;
  week: number;
}): Promise<CommunityPost> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("community_posts")
    .insert({
      ...post,
      reactions: { "❤️": 0, "🤗": 0, "💪": 0, "😂": 0 },
      hidden: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CommunityPost;
}

export async function toggleReaction(
  postId: string,
  userId: string,
  emoji: string
): Promise<{ added: boolean }> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("community_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("community_reactions")
      .delete()
      .eq("id", existing.id);

    await updateReactionCount(postId, emoji, -1);
    return { added: false };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("community_reactions").insert({
      post_id: postId,
      user_id: userId,
      emoji,
    });

    await updateReactionCount(postId, emoji, 1);
    return { added: true };
  }
}

async function updateReactionCount(
  postId: string,
  emoji: string,
  delta: number
) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from("community_posts")
    .select("reactions")
    .eq("id", postId)
    .single();

  if (post) {
    const reactions = post.reactions ?? {};
    reactions[emoji] = Math.max(0, (reactions[emoji] ?? 0) + delta);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("community_posts")
      .update({ reactions })
      .eq("id", postId);
  }
}

export async function getUserReactions(
  userId: string,
  postIds: string[]
): Promise<Record<string, Set<string>>> {
  if (postIds.length === 0) return {};

  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("community_reactions")
    .select("post_id, emoji")
    .eq("user_id", userId)
    .in("post_id", postIds);

  const result: Record<string, Set<string>> = {};
  for (const row of data ?? []) {
    if (!result[row.post_id]) result[row.post_id] = new Set();
    result[row.post_id].add(row.emoji);
  }
  return result;
}

export async function reportPost(
  postId: string,
  userId: string,
  reason: string
): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("community_reports").insert({
    post_id: postId,
    user_id: userId,
    reason,
  });
}
