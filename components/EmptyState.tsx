"use client";

import { m as motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "pink" | "purple" | "green" | "blue";
}

const variants = {
  default: {
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-400 dark:text-gray-500",
    buttonBg: "bg-pink-400 hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500",
  },
  pink: {
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-400",
    buttonBg: "bg-pink-400 hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500",
  },
  purple: {
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-400",
    buttonBg: "bg-purple-400 hover:bg-purple-500 dark:hover:bg-purple-600 dark:bg-purple-500",
  },
  green: {
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-400",
    buttonBg: "bg-green-400 hover:bg-green-50 dark:bg-green-500",
  },
  blue: {
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-400",
    buttonBg: "bg-blue-400 hover:bg-blue-50 dark:bg-blue-500",
  },
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "pink",
}: EmptyStateProps) {
  const colors = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-pink-100 dark:border-pink-900/30 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <Icon className={`w-8 h-8 ${colors.iconColor}`} />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-semibold text-gray-800 dark:text-gray-200 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 dark:text-gray-400 mb-4"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`${colors.buttonBg} text-white px-6 py-2.5 rounded-xl font-medium transition-colors`}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

// Pre-built empty states for common scenarios
import { BarChart3, CalendarDays, Smile } from "lucide-react";

export function NoDataYet({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="Pas encore de données"
      description="Commencez à enregistrer vos données pour voir votre progression ici."
      action={{ label: "Ajouter des données", onClick: onAction }}
      variant="pink"
    />
  );
}

export function NoAppointments({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={CalendarDays}
      title="Aucun rendez-vous"
      description="Ajoutez vos rendez-vous médicaux pour ne rien oublier."
      action={{ label: "Ajouter un RDV", onClick: onAction }}
      variant="purple"
    />
  );
}

export function NoSymptoms() {
  return (
    <div className="text-center py-6 text-gray-400 dark:text-gray-500">
      <Smile className="w-8 h-8 mx-auto mb-2 text-green-300" />
      <p className="text-sm">Pas de symptômes enregistrés</p>
    </div>
  );
}
