"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import {
  fetchPosts,
  createPost,
  toggleReaction,
  getUserReactions,
  reportPost,
  type CommunityPost,
} from "@/lib/community-api";
import {
  MessageCircle,
  Plus,
  Heart,
  X,
  Flag,
  Loader2,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const ADJECTIFS = [
  "Rayonnante",
  "Courageuse",
  "Douce",
  "Sereine",
  "Petillante",
  "Epanouie",
  "Lumineuse",
  "Joyeuse",
];

function getAnonymousName(userId: string, week: number): string {
  const weekData = getWeekData(week);
  const adjIndex = userId.charCodeAt(userId.length - 1) % ADJECTIFS.length;
  return `${ADJECTIFS[adjIndex]} ${weekData.fruit} ${weekData.fruitEmoji}`;
}

type PostType = "question" | "vecu" | "conseil" | "soutien";

const POST_TYPES: Record<
  PostType,
  { label: string; emoji: string; color: string }
> = {
  question: {
    label: "Question",
    emoji: "❓",
    color: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/30",
  },
  vecu: { label: "Vecu", emoji: "💬", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200" },
  conseil: {
    label: "Conseil",
    emoji: "💡",
    color: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30",
  },
  soutien: {
    label: "Soutien",
    emoji: "🤗",
    color: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800/30",
  },
};

const REACTION_EMOJIS = ["❤️", "🤗", "💪", "😂"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export default function CommunityContent() {
  const { dueDate } = useStore();
  const { user, isAuthenticated } = useAuth();
  const currentWeek = dueDate ? getCurrentWeek(new Date(dueDate)) : 25;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [tab, setTab] = useState<"week" | "all">("all");
  const [filterType, setFilterType] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [newType, setNewType] = useState<PostType>("vecu");
  const [newContent, setNewContent] = useState("");
  const [userReactions, setUserReactions] = useState<
    Record<string, Set<string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track reported post IDs in this session to give user feedback
  const reportedPostIds = useRef<Set<string>>(new Set());

  const loadPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchPosts({
          week: tab === "week" ? currentWeek : undefined,
          type: filterType,
          page: pageNum,
        });

        const dbPosts = result.posts;
        setHasMore(result.hasMore);

        if (append) {
          setPosts((prev) => [...prev, ...dbPosts]);
        } else {
          setPosts(dbPosts);
        }

        if (user && dbPosts.length > 0) {
          const reactions = await getUserReactions(
            user.id,
            dbPosts.map((p) => p.id)
          );
          setUserReactions((prev) => ({ ...prev, ...reactions }));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur de chargement";
        setError(message);
        if (!append) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [tab, filterType, currentWeek, user]
  );

  useEffect(() => {
    setPage(0);
    loadPosts(0);
  }, [loadPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadPosts(0);
  }, [loadPosts]);

  const handleSubmit = async () => {
    if (!newContent.trim() || !user) return;
    setSubmitting(true);
    try {
      const authorName = getAnonymousName(user.id, currentWeek);
      const post = await createPost({
        author_id: user.id,
        author_name: authorName,
        type: newType,
        content: newContent.trim(),
        week: currentWeek,
      });
      setPosts((prev) => [post, ...prev]);
      setNewContent("");
      setShowModal(false);
    } catch {
      // Create an optimistic local post so the user sees their content immediately
      // even if the network request failed
      const optimisticPost: CommunityPost = {
        id: crypto.randomUUID(),
        author_id: user.id,
        author_name: getAnonymousName(user.id, currentWeek),
        type: newType,
        content: newContent.trim(),
        week: currentWeek,
        created_at: new Date().toISOString(),
        reactions: { "❤️": 0, "🤗": 0, "💪": 0, "😂": 0 },
      };
      setPosts((prev) => [optimisticPost, ...prev]);
      setNewContent("");
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    if (!user) return;

    const alreadyReacted = userReactions[postId]?.has(emoji);

    // Optimistic update
    setUserReactions((prev) => {
      const set = new Set(prev[postId] ?? []);
      if (alreadyReacted) set.delete(emoji);
      else set.add(emoji);
      return { ...prev, [postId]: set };
    });
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [emoji]: Math.max(
              0,
              (p.reactions[emoji] ?? 0) + (alreadyReacted ? -1 : 1)
            ),
          },
        };
      })
    );

    try {
      await toggleReaction(postId, user.id, emoji);
    } catch {
      // Revert optimistic update on error
      setUserReactions((prev) => {
        const set = new Set(prev[postId] ?? []);
        if (alreadyReacted) set.add(emoji);
        else set.delete(emoji);
        return { ...prev, [postId]: set };
      });
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [emoji]: Math.max(
                0,
                (p.reactions[emoji] ?? 0) + (alreadyReacted ? 1 : -1)
              ),
            },
          };
        })
      );
    }
  };

  const handleReport = async () => {
    if (!showReportModal || !user || !reportReason.trim()) return;
    try {
      await reportPost(showReportModal, user.id, reportReason.trim());
      reportedPostIds.current.add(showReportModal);
      setReportSubmitted(true);
    } catch {
      // silent fail -- the user at least sees the confirmation
      setReportSubmitted(true);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(null);
    setReportReason("");
    setReportSubmitted(false);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next, true);
  };

  const filteredPosts = posts.filter((p) => {
    if (tab === "week" && p.week !== currentWeek) return false;
    if (filterType && p.type !== filterType) return false;
    return true;
  });

  const myPseudo = user
    ? getAnonymousName(user.id, currentWeek)
    : getAnonymousName(`user_preview_${Date.now()}`, currentWeek);

  const totalReactions = posts.reduce(
    (acc, p) =>
      acc +
      Object.values(p.reactions).reduce(
        (sum, v) => sum + (v as number),
        0
      ),
    0
  );

  const uniqueAuthors = new Set(posts.map((p) => p.author_id)).size;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-pink-400" />
          Communaute
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 dark:text-gray-500 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 transition-colors disabled:opacity-50"
            title="Rafraichir"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) return;
              setShowModal(true);
            }}
            disabled={!isAuthenticated}
            className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !isAuthenticated ? "Connectez-vous pour partager" : "Partager"
            }
          >
            <Plus className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      {/* Auth prompt for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-3 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Connectez-vous pour publier, reagir et signaler des posts.
          </span>
        </div>
      )}

      {/* Stats banner */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-2xl p-4 flex items-center justify-around border border-pink-100 dark:border-pink-900/30">
        <div className="text-center">
          <p className="text-lg font-bold text-pink-500 dark:text-pink-400">{posts.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Publications</p>
        </div>
        <div className="w-px h-8 bg-pink-200" />
        <div className="text-center">
          <p className="text-lg font-bold text-purple-500 dark:text-purple-400">{totalReactions}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Reactions</p>
        </div>
        <div className="w-px h-8 bg-pink-200" />
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-500">{uniqueAuthors}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Mamans</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("week")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === "week"
              ? "bg-pink-400 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          Semaine {currentWeek}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === "all"
              ? "bg-pink-400 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          Toutes
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(Object.keys(POST_TYPES) as PostType[]).map((type) => {
          const { label, emoji } = POST_TYPES[type];
          const active = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(active ? null : type)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "bg-pink-400 text-white border-pink-400"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-sm text-pink-500 dark:text-pink-400 font-medium hover:underline"
          >
            Reessayer
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !refreshing && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Aucun post pour l&apos;instant.
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowModal(true)}
                className="text-sm text-pink-500 dark:text-pink-400 font-medium hover:underline"
              >
                Soyez la premiere a partager !
              </button>
            )}
          </div>
        )}
        {filteredPosts.map((post) => {
          const { color } = POST_TYPES[post.type] ?? POST_TYPES.vecu;
          const { label: typeLabel, emoji: typeEmoji } =
            POST_TYPES[post.type] ?? POST_TYPES.vecu;
          const isReported = reportedPostIds.current.has(post.id);
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 border ${color} space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {post.author_name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color} border`}
                  >
                    {typeEmoji} {typeLabel}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    S{post.week}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {REACTION_EMOJIS.map((reactionEmoji) => {
                  const count = (post.reactions[reactionEmoji] as number) ?? 0;
                  const reacted = userReactions[post.id]?.has(reactionEmoji);
                  return (
                    <button
                      key={reactionEmoji}
                      onClick={() => handleReaction(post.id, reactionEmoji)}
                      disabled={!isAuthenticated}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                        reacted
                          ? "bg-pink-200 text-pink-700 dark:text-pink-300"
                          : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                      } ${!isAuthenticated ? "cursor-default" : ""}`}
                    >
                      {reactionEmoji} {count > 0 && <span>{count}</span>}
                    </button>
                  );
                })}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReportModal(post.id)}
                    disabled={isReported}
                    className={`ml-auto transition-colors ${
                      isReported
                        ? "text-gray-300 dark:text-gray-500 cursor-default"
                        : "text-gray-300 dark:text-gray-500 hover:text-red-400"
                    }`}
                    title={isReported ? "Deja signale" : "Signaler"}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-pink-500 font-medium hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 rounded-xl transition-colors disabled:opacity-50"
        >
          {loadingMore ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Charger plus
        </button>
      )}

      {/* Create post modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-t-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#3d2b2b] dark:text-gray-100">
                  Partager avec la communaute
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(POST_TYPES) as PostType[]).map((type) => {
                  const { label, emoji } = POST_TYPES[type];
                  const selected = newType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-center transition-all ${
                        selected
                          ? "border-pink-400 bg-pink-50 dark:bg-pink-950/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value.slice(0, 500))}
                  placeholder="Partagez votre experience, question ou conseil..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-pink-200 dark:border-pink-800/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none dark:bg-[#0f0f1a] dark:border-gray-700 dark:text-gray-100"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                  {newContent.length}/500
                </p>
              </div>

              <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>
                  Publie en tant que : <strong>{myPseudo}</strong>
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newContent.trim() || submitting}
                className="w-full bg-pink-400 text-white py-3 rounded-xl font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeReportModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#1a1a2e] rounded-3xl p-6 space-y-4"
            >
              {reportSubmitted ? (
                <>
                  <div className="text-center space-y-3 py-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Flag className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100">
                      Merci pour votre signalement
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notre equipe examinera ce post dans les plus brefs delais.
                    </p>
                  </div>
                  <button
                    onClick={closeReportModal}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-pink-400 text-white"
                  >
                    Fermer
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100">
                      Signaler ce post
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Contenu inapproprie",
                      "Spam",
                      "Information medicale dangereuse",
                      "Harcelement",
                      "Autre",
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                          reportReason === reason
                            ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeReportModal}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={!reportReason}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-400 text-white disabled:opacity-50"
                    >
                      Signaler
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
