"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import { createClient } from "@/lib/supabase";
import { MessageCircle, Plus, Heart, X } from "lucide-react";

const ADJECTIFS = ['Rayonnante', 'Courageuse', 'Douce', 'Séreine', 'Pétillante', 'Épanouie', 'Lumineuse', 'Joyeuse'];

function getAnonymousName(userId: string, week: number): string {
  const weekData = getWeekData(week);
  const adjIndex = userId.charCodeAt(0) % ADJECTIFS.length;
  return `${ADJECTIFS[adjIndex]} ${weekData.fruit} ${weekData.fruitEmoji}`;
}

type PostType = 'question' | 'vecu' | 'conseil' | 'soutien';

const POST_TYPES: Record<PostType, { label: string; emoji: string; color: string }> = {
  question: { label: 'Question', emoji: '❓', color: 'bg-yellow-50 border-yellow-200' },
  vecu: { label: 'Vécu', emoji: '💬', color: 'bg-blue-50 border-blue-200' },
  conseil: { label: 'Conseil', emoji: '💡', color: 'bg-green-50 border-green-200' },
  soutien: { label: 'Soutien', emoji: '🤗', color: 'bg-pink-50 border-pink-200' },
};

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  type: PostType;
  content: string;
  week: number;
  createdAt: string;
  reactions: Record<string, number>;
}

const EXAMPLE_POSTS: CommunityPost[] = [
  {
    id: 'example-1',
    authorId: 'user_ray',
    authorName: 'Rayonnante Banane 🍌',
    type: 'question',
    content: 'Est-ce que quelqu\'un d\'autre ressent des douleurs dans les côtes à 24 semaines ? Mon bébé adore me donner des coups là-haut ! 😅',
    week: 24,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 5, '🤗': 3, '💪': 1, '😂': 2 },
  },
  {
    id: 'example-2',
    authorId: 'user_cou',
    authorName: 'Courageuse Mangue 🥭',
    type: 'vecu',
    content: 'Aujourd\'hui j\'ai senti mon bébé bouger pour la première fois clairement ! À 20 semaines, c\'est comme des petites bulles qui éclatent. Un moment magique 🥹',
    week: 20,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 12, '🤗': 8, '💪': 0, '😂': 0 },
  },
  {
    id: 'example-3',
    authorId: 'user_epa',
    authorName: 'Épanouie Avocat 🥑',
    type: 'conseil',
    content: 'Conseil pour le 3ème trimestre : mettez un oreiller entre les genoux pour dormir sur le côté. Ça change la vie ! La sage-femme me l\'a recommandé à 28 semaines.',
    week: 28,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 7, '🤗': 2, '💪': 4, '😂': 0 },
  },
  {
    id: 'example-4',
    authorId: 'user_ser',
    authorName: 'Séreine Coco 🥥',
    type: 'soutien',
    content: 'Je suis à 30 semaines et j\'ai peur de l\'accouchement. Quelqu\'une peut partager son expérience positive ? J\'ai besoin d\'encouragements 💪',
    week: 30,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 15, '🤗': 10, '💪': 6, '😂': 0 },
  },
  {
    id: 'example-5',
    authorId: 'user_pet',
    authorName: 'Pétillante Pastèque 🍉',
    type: 'vecu',
    content: 'Échographie morphologique à 22 semaines : tout est parfait ! Le médecin a dit "bébé parfait" et j\'ai pleuré de joie 😭❤️ C\'est le plus beau jour !',
    week: 22,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 20, '🤗': 14, '💪': 3, '😂': 1 },
  },
  {
    id: 'example-6',
    authorId: 'user_lum',
    authorName: 'Lumineuse Melon 🍈',
    type: 'conseil',
    content: 'Pour les brûlures d\'estomac (semaine 26) : manger en petites quantités plusieurs fois par jour et éviter de se coucher juste après le repas. Aussi les amandes aident !',
    week: 26,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { '❤️': 9, '🤗': 3, '💪': 5, '😂': 0 },
  },
];

const REACTION_EMOJIS = ['❤️', '🤗', '💪', '😂'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export default function CommunautePage() {
  const { dueDate } = useStore();
  const currentWeek = dueDate ? getCurrentWeek(new Date(dueDate)) : 25;

  const [posts, setPosts] = useState<CommunityPost[]>(EXAMPLE_POSTS);
  const [tab, setTab] = useState<'week' | 'all'>('all');
  const [filterType, setFilterType] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState<PostType>('vecu');
  const [newContent, setNewContent] = useState('');
  const [localReactions, setLocalReactions] = useState<Record<string, Set<string>>>({});

  // Load posts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('community-posts');
      if (stored) {
        const parsed: CommunityPost[] = JSON.parse(stored);
        setPosts([...parsed, ...EXAMPLE_POSTS]);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePost = (post: CommunityPost) => {
    setPosts(prev => {
      const updated = [post, ...prev];
      try {
        const userPosts = updated.filter(p => !p.id.startsWith('example-'));
        localStorage.setItem('community-posts', JSON.stringify(userPosts));
      } catch { /* ignore */ }
      return updated;
    });

    // Try Supabase
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('community_posts').insert({
        id: post.id,
        author_id: post.authorId,
        author_name: post.authorName,
        type: post.type,
        content: post.content,
        week: post.week,
        created_at: post.createdAt,
      }).then(() => {}).catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    const userId = `user_${Math.random().toString(36).slice(2, 8)}`;
    const post: CommunityPost = {
      id: crypto.randomUUID(),
      authorId: userId,
      authorName: getAnonymousName(userId, currentWeek),
      type: newType,
      content: newContent.trim(),
      week: currentWeek,
      createdAt: new Date().toISOString(),
      reactions: { '❤️': 0, '🤗': 0, '💪': 0, '😂': 0 },
    };
    savePost(post);
    setNewContent('');
    setShowModal(false);
  };

  const handleReaction = (postId: string, emoji: string) => {
    const key = `${postId}-${emoji}`;
    setLocalReactions(prev => {
      const reacted = new Set(prev[postId] ?? []);
      if (reacted.has(emoji)) {
        reacted.delete(emoji);
      } else {
        reacted.add(emoji);
      }
      return { ...prev, [postId]: reacted };
    });
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const alreadyReacted = localReactions[postId]?.has(emoji);
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [emoji]: Math.max(0, (p.reactions[emoji] ?? 0) + (alreadyReacted ? -1 : 1)),
          },
        };
      })
    );
  };

  const filteredPosts = posts.filter(p => {
    if (tab === 'week' && p.week !== currentWeek) return false;
    if (filterType && p.type !== filterType) return false;
    return true;
  });

  const myPseudo = getAnonymousName(`user_preview_${Date.now()}`, currentWeek);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-pink-400" />
          Communauté
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Partager
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('week')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'week' ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Semaine {currentWeek}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Toutes
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(Object.keys(POST_TYPES) as PostType[]).map(type => {
          const { label, emoji } = POST_TYPES[type];
          const active = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(active ? null : type)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active ? 'bg-pink-400 text-white border-pink-400' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            Aucun post pour l&apos;instant. Soyez la première à partager ! ✨
          </div>
        )}
        {filteredPosts.map(post => {
          const { emoji, color } = POST_TYPES[post.type] ?? POST_TYPES.vecu;
          const { label: typeLabel } = POST_TYPES[post.type] ?? POST_TYPES.vecu;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 border ${color} space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{post.authorName}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color} border`}>
                    {emoji} {typeLabel}
                  </span>
                  <span className="text-[10px] text-gray-400">{timeAgo(post.createdAt)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
              <div className="flex gap-2 pt-1">
                {REACTION_EMOJIS.map(emoji => {
                  const count = post.reactions[emoji] ?? 0;
                  const reacted = localReactions[post.id]?.has(emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(post.id, emoji)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                        reacted ? 'bg-pink-200 text-pink-700' : 'bg-white/60 text-gray-600 hover:bg-pink-50'
                      }`}
                    >
                      {emoji} {count > 0 && <span>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#3d2b2b]">Partager avec la communauté</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(POST_TYPES) as PostType[]).map(type => {
                  const { label, emoji, color } = POST_TYPES[type];
                  const selected = newType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-center transition-all ${
                        selected ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-[10px] font-medium text-gray-600">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value.slice(0, 400))}
                  placeholder="Partagez votre expérience, question ou conseil..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{newContent.length}/400</p>
              </div>

              {/* Pseudonyme preview */}
              <div className="bg-pink-50 rounded-xl p-3 text-xs text-gray-600 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>Publié en tant que : <strong>{myPseudo}</strong></span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newContent.trim()}
                className="w-full bg-pink-400 text-white py-3 rounded-xl font-medium hover:bg-pink-500 transition-colors disabled:opacity-50"
              >
                Publier
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
