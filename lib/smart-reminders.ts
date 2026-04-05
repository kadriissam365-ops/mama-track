import { getCurrentWeek } from './pregnancy-data';

export interface Reminder {
  id: string;
  message: string;
  priority: number; // Lower = higher priority
  icon: string;
}

interface ReminderInput {
  weightEntries: Array<{ date: string; weight: number }>;
  waterIntake: Record<string, number>;
  appointments: Array<{ date: string; title: string; done: boolean }>;
  kickSessions: Array<{ startTime: string }>;
  checklistItems: Array<{ done: boolean }>;
  dueDate: string | null;
}

export function getSmartReminders(data: ReminderInput): Reminder[] {
  const reminders: Reminder[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hour = now.getHours();

  // 1. Poids non loggué depuis >7 jours
  if (data.weightEntries.length === 0) {
    reminders.push({
      id: 'weight',
      message: '⚖️ Pensez à vous peser !',
      priority: 3,
      icon: '⚖️',
    });
  } else {
    const lastWeight = data.weightEntries[data.weightEntries.length - 1];
    const lastDate = new Date(lastWeight.date);
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 7) {
      reminders.push({
        id: 'weight',
        message: `⚖️ Vous n'avez pas pesé depuis ${daysSince} jours. Pensez à vous peser !`,
        priority: 3,
        icon: '⚖️',
      });
    }
  }

  // 2. Eau insuffisante après 18h
  if (hour >= 18) {
    const waterToday = data.waterIntake[today] ?? 0;
    if (waterToday < 500) {
      reminders.push({
        id: 'water',
        message: '💧 Hydratation insuffisante aujourd\'hui',
        priority: 2,
        icon: '💧',
      });
    }
  }

  // 3. RDV dans <48h
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const upcomingAppt = data.appointments.find(a => {
    if (a.done) return false;
    const apptDate = new Date(a.date);
    return apptDate >= now && apptDate <= in48h;
  });
  if (upcomingAppt) {
    const apptDate = new Date(upcomingAppt.date);
    const hoursUntil = Math.round((apptDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    const timeStr = hoursUntil < 24 ? 'aujourd\'hui' : 'demain';
    reminders.push({
      id: 'appointment',
      message: `📅 RDV ${timeStr} : ${upcomingAppt.title}`,
      priority: 1, // Highest priority
      icon: '📅',
    });
  }

  // 4. Aucun kick depuis >24h si >28 SA
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const week = getCurrentWeek(dueDate);
    if (week >= 28) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentKick = data.kickSessions.some(k => new Date(k.startTime) >= yesterday);
      if (!recentKick) {
        reminders.push({
          id: 'kicks',
          message: '👶 Bébé a bougé aujourd\'hui ?',
          priority: 2,
          icon: '👶',
        });
      }
    }
  }

  // 5. Checklist <20% si >20 SA
  if (data.dueDate && data.checklistItems.length > 0) {
    const dueDate = new Date(data.dueDate);
    const week = getCurrentWeek(dueDate);
    if (week >= 20) {
      const doneItems = data.checklistItems.filter(i => i.done).length;
      const percent = (doneItems / data.checklistItems.length) * 100;
      if (percent < 20) {
        reminders.push({
          id: 'checklist',
          message: '📋 Votre liste de préparation attend !',
          priority: 4,
          icon: '📋',
        });
      }
    }
  }

  // Sort by priority and return
  return reminders.sort((a, b) => a.priority - b.priority);
}
