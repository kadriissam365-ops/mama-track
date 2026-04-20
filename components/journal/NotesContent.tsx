"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Search, X, Trash2, Edit3, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { getCurrentWeek } from "@/lib/pregnancy-data";
import {
  getJournalNotes,
  createJournalNote,
  updateJournalNote,
  deleteJournalNote,
  type JournalNote,
} from "@/lib/supabase-api";

const MOODS = ["😊", "😍", "😴", "🤢", "😰"];

function NoteForm({
  week,
  initial,
  onSubmit,
  onCancel,
}: {
  week: number;
  initial?: Partial<JournalNote>;
  onSubmit: (data: { title?: string; body: string; mood_emoji?: string; week: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [mood, setMood] = useState(initial?.mood_emoji || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSaving(true);
    await onSubmit({ title: title || undefined, body, mood_emoji: mood || undefined, week });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30"
    >
      <input
        className="w-full text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-2 mb-3 focus:outline-none placeholder-gray-400 dark:placeholder-gray-600"
        placeholder="Titre (optionnel)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full text-sm text-gray-600 dark:text-gray-300 resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 mb-3"
        rows={4}
        placeholder="Comment tu te sens aujourd'hui ?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(mood === m ? "" : m)}
              className={`text-xl transition-transform ${mood === m ? "scale-125" : "opacity-50 hover:opacity-100"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800">
            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!body.trim() || saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-sm rounded-xl disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Sauvegarder
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useStore();
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<JournalNote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const currentWeek = dueDate ? getCurrentWeek(dueDate) : 20;

  const loadNotes = async () => {
    if (!user) return;
    const data = await getJournalNotes(user.id);
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.body.toLowerCase().includes(q) ||
      (n.title || "").toLowerCase().includes(q)
    );
  });

  const handleCreate = async (data: {
    title?: string;
    body: string;
    mood_emoji?: string;
    week: number;
  }) => {
    if (!user) return;
    await createJournalNote(user.id, data);
    setShowForm(false);
    await loadNotes();
  };

  const handleUpdate = async (data: {
    title?: string;
    body: string;
    mood_emoji?: string;
    week: number;
  }) => {
    if (!user || !editNote) return;
    await updateJournalNote(editNote.id, user.id, {
      title: data.title,
      body: data.body,
      mood_emoji: data.mood_emoji,
    });
    setEditNote(null);
    await loadNotes();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteJournalNote(id, user.id);
    setDeleteId(null);
    await loadNotes();
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-yellow-100 dark:border-yellow-900/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Journal texte</h1>
            <p className="text-xs text-amber-500">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditNote(null); }}
            className="p-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-500" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm focus:outline-none focus:border-amber-300 placeholder-gray-400 dark:placeholder-gray-600"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* New note form */}
        <AnimatePresence>
          {showForm && !editNote && (
            <NoteForm
              week={currentWeek}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Notes list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search ? "Aucun resultat" : "Aucune note pour l'instant"}
            </p>
            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sm text-amber-500 underline"
              >
                Ecrire ma premiere note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, idx) => (
              <AnimatePresence key={note.id}>
                {editNote?.id === note.id ? (
                  <NoteForm
                    week={note.week}
                    initial={note}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditNote(null)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {note.mood_emoji && (
                          <span className="text-xl flex-shrink-0">{note.mood_emoji}</span>
                        )}
                        {note.title && (
                          <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm truncate">{note.title}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => { setEditNote(note); setShowForm(false); }}
                          className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteId(note.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{note.body}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-full px-2 py-0.5">
                        S.{note.week}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(note.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg"
            >
              <p className="text-center font-semibold text-gray-800 dark:text-gray-200 mb-2">Supprimer cette note ?</p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Cette action est irreversible</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
