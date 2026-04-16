"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Plus, Trash2, AlertTriangle, Hospital, Heart, Siren, Edit3, Save, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  emoji: string;
}

const PRESET_ROLES = [
  { role: "Maternité", emoji: "🏥" },
  { role: "Gynécologue", emoji: "👩‍⚕️" },
  { role: "Sage-femme", emoji: "🤱" },
  { role: "Médecin traitant", emoji: "🩺" },
  { role: "Partenaire", emoji: "💑" },
  { role: "Maman / Famille", emoji: "👨‍👩‍👧" },
  { role: "Amie proche", emoji: "👭" },
  { role: "SAMU (15)", emoji: "🚑" },
  { role: "Autre", emoji: "📞" },
];

const EMERGENCY_SIGNS = [
  {
    title: "Appeler le 15 (SAMU) immédiatement",
    emoji: "🚨",
    color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30",
    symptoms: [
      "Saignements abondants",
      "Douleurs abdominales intenses et persistantes",
      "Perte de connaissance ou malaise sévère",
      "Convulsions",
      "Fièvre > 38.5°C avec frissons",
      "Maux de tête violents avec troubles visuels",
    ],
  },
  {
    title: "Consulter dans les 24h",
    emoji: "⚠️",
    color: "bg-orange-50 dark:bg-orange-950/30 border-orange-200",
    symptoms: [
      "Légers saignements (spotting)",
      "Contractions régulières avant 37 SA",
      "Perte de liquide amniotique",
      "Bébé qui ne bouge plus depuis >12h",
      "Gonflement soudain du visage ou des mains",
      "Brûlures urinaires intenses",
      "Démangeaisons généralisées intenses",
    ],
  },
  {
    title: "En parler au prochain RDV",
    emoji: "💬",
    color: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/30",
    symptoms: [
      "Fatigue inhabituelle",
      "Nausées persistantes après 16 SA",
      "Douleurs légères au bas-ventre",
      "Pertes vaginales inhabituelles",
      "Constipation ou hémorroïdes",
      "Anxiété ou tristesse persistante",
    ],
  },
];

function loadContacts(): EmergencyContact[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mt-emergency-contacts") || "[]");
  } catch { return []; }
}

function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem("mt-emergency-contacts", JSON.stringify(contacts));
}

export default function UrgencesPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedSign, setExpandedSign] = useState<number | null>(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0]);

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

  function addContact() {
    if (!name.trim() || !phone.trim()) return;
    const contact: EmergencyContact = {
      id: editId || crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      role: selectedRole.role,
      emoji: selectedRole.emoji,
    };

    let updated: EmergencyContact[];
    if (editId) {
      updated = contacts.map((c) => (c.id === editId ? contact : c));
    } else {
      updated = [...contacts, contact];
    }
    setContacts(updated);
    saveContacts(updated);
    resetForm();
  }

  function removeContact(id: string) {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
    setConfirmDelete(null);
  }

  function startEdit(contact: EmergencyContact) {
    setName(contact.name);
    setPhone(contact.phone);
    setSelectedRole(PRESET_ROLES.find((r) => r.role === contact.role) || PRESET_ROLES[0]);
    setEditId(contact.id);
    setShowAdd(true);
  }

  function resetForm() {
    setName("");
    setPhone("");
    setSelectedRole(PRESET_ROLES[0]);
    setEditId(null);
    setShowAdd(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-400" />
            Urgences
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Contacts et signaux d&apos;alerte</p>
        </div>
        <a
          href="tel:15"
          className="flex items-center gap-2 bg-red-50 dark:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
        >
          <Phone className="w-4 h-4" />
          SAMU 15
        </a>
      </div>

      {/* Quick call buttons */}
      <div className="grid grid-cols-3 gap-2">
        <a href="tel:15" className="flex flex-col items-center gap-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl py-3 hover:bg-red-100 dark:bg-red-900/30 transition-colors">
          <span className="text-xl">🚑</span>
          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">SAMU 15</span>
        </a>
        <a href="tel:18" className="flex flex-col items-center gap-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded-2xl py-3 hover:bg-orange-100 dark:bg-orange-900/30 transition-colors">
          <span className="text-xl">🚒</span>
          <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Pompiers 18</span>
        </a>
        <a href="tel:112" className="flex flex-col items-center gap-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-2xl py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 dark:bg-blue-900/30 transition-colors">
          <span className="text-xl">🆘</span>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Urgences 112</span>
        </a>
      </div>

      {/* My contacts */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            Mes contacts
          </h3>
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="w-7 h-7 bg-pink-400 rounded-lg flex items-center justify-center text-white hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {contacts.length === 0 && !showAdd && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Ajoutez votre maternité, gynécologue, sage-femme...
          </p>
        )}

        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 bg-pink-50 dark:bg-pink-950/30 rounded-2xl px-3 py-2.5"
            >
              <span className="text-xl">{contact.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 truncate">{contact.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{contact.role} · {contact.phone}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={`tel:${contact.phone}`}
                  className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-50 dark:bg-green-500 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                </a>
                <button
                  onClick={() => startEdit(contact)}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setConfirmDelete(contact.id)}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role.role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                        selectedRole.role === role.role
                          ? "bg-pink-400 text-white"
                          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span>{role.emoji}</span>
                      {role.role}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addContact}
                    disabled={!name.trim() || !phone.trim()}
                    className="flex-1 flex items-center justify-center gap-1 bg-pink-400 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {editId ? "Modifier" : "Ajouter"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl text-sm hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emergency signs */}
      <div className="space-y-3">
        <h2 className="font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Signaux d&apos;alerte
        </h2>

        {EMERGENCY_SIGNS.map((section, i) => (
          <div key={i} className={`${section.color} border rounded-2xl overflow-hidden`}>
            <button
              onClick={() => setExpandedSign(expandedSign === i ? null : i)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{section.emoji}</span>
                <span className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">{section.title}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">{expandedSign === i ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
              {expandedSign === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="px-4 pb-3 space-y-1.5">
                    {section.symptoms.map((symptom, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-xs mt-1">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Hospital bag reminder */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-5 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <Hospital className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm mb-1">Valise maternité</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              Pensez à préparer votre valise vers 32-34 SA. Documents à ne pas oublier :
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Carte vitale et carte de mutuelle</li>
              <li>• Carnet de santé maternité</li>
              <li>• Carte de groupe sanguin</li>
              <li>• Résultats des derniers examens</li>
              <li>• Projet de naissance (si préparé)</li>
              <li>• Pièce d&apos;identité</li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer ce contact ?"
        message="Cette action est irréversible."
        onConfirm={() => confirmDelete && removeContact(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
