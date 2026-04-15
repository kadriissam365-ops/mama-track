/**
 * PWA Notifications for MamaTrack
 * Handles permission requests, Web Push subscriptions, and notification scheduling
 */

export interface NotificationSettings {
  waterReminders: boolean;
  medicationMorning: boolean;
  medicationEvening: boolean;
  appointmentReminders: boolean;
  reminderIntervalHours: number;
}

// VAPID public key for Web Push (set in env)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

const DEFAULT_SETTINGS: NotificationSettings = {
  waterReminders: true,
  medicationMorning: false,
  medicationEvening: false,
  appointmentReminders: true,
  reminderIntervalHours: 2,
};

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission and optionally subscribe to Web Push
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();

    // If granted, also subscribe to Web Push for background notifications
    if (permission === 'granted') {
      await subscribeToPush();
    }

    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// ─── Web Push Subscription ───────────────────────────────────────────

/**
 * Convert a base64 VAPID key to a Uint8Array for the Push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe the current browser to Web Push notifications.
 * Registers the subscription with the backend API.
 * Returns true on success.
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isServiceWorkerSupported() || !VAPID_PUBLIC_KEY) return false;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription first
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Send subscription to our backend
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return false;
  }
}

/**
 * Unsubscribe the current browser from Web Push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Notify backend to remove subscription
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return false;
  }
}

/**
 * Check if the user already has an active push subscription.
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Send a server-side push notification via the API.
 */
export async function sendPushNotification(options: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  userId?: string;
}): Promise<boolean> {
  try {
    const response = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return response.ok;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

// ─── Local Notifications & Settings ─────────────────────────────────

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('mamatrack-notifications');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore errors
  }
  
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('mamatrack-notifications', JSON.stringify(updated));
  }
  
  return updated;
}

// Show a notification
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  const permission = getNotificationPermission();
  
  if (permission !== 'granted') {
    return false;
  }
  
  try {
    // Try using service worker first (for background notifications)
    if (isServiceWorkerSupported()) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
      return true;
    }
    
    // Fallback to regular notification
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

// Schedule water reminder
let waterReminderInterval: ReturnType<typeof setInterval> | null = null;

export function startWaterReminders(intervalHours: number = 2): void {
  stopWaterReminders();
  
  const intervalMs = intervalHours * 60 * 60 * 1000; // Convert to milliseconds
  
  waterReminderInterval = setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Only remind between 8am and 10pm
    if (hour >= 8 && hour < 22) {
      showNotification('💧 Hydratation !', {
        body: "N'oubliez pas de boire de l'eau. Votre corps et bébé en ont besoin !",
        tag: 'water-reminder',
      });
    }
  }, intervalMs);
}

export function stopWaterReminders(): void {
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
    waterReminderInterval = null;
  }
}

// Schedule medication reminders
let morningReminderTimeout: ReturnType<typeof setTimeout> | null = null;
let eveningReminderTimeout: ReturnType<typeof setTimeout> | null = null;

function getNextOccurrence(hour: number, minute: number = 0): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target;
}

export function scheduleMorningReminder(): void {
  cancelMorningReminder();
  
  const next = getNextOccurrence(8, 0); // 8:00 AM
  const delay = next.getTime() - Date.now();
  
  morningReminderTimeout = setTimeout(() => {
    showNotification('💊 Médicaments du matin', {
      body: "N'oubliez pas de prendre vos vitamines/médicaments du matin !",
      tag: 'medication-morning',
    });
    
    // Reschedule for next day
    scheduleMorningReminder();
  }, delay);
}

export function cancelMorningReminder(): void {
  if (morningReminderTimeout) {
    clearTimeout(morningReminderTimeout);
    morningReminderTimeout = null;
  }
}

export function scheduleEveningReminder(): void {
  cancelEveningReminder();
  
  const next = getNextOccurrence(20, 0); // 8:00 PM
  const delay = next.getTime() - Date.now();
  
  eveningReminderTimeout = setTimeout(() => {
    showNotification('💊 Médicaments du soir', {
      body: "N'oubliez pas de prendre vos vitamines/médicaments du soir !",
      tag: 'medication-evening',
    });
    
    // Reschedule for next day
    scheduleEveningReminder();
  }, delay);
}

export function cancelEveningReminder(): void {
  if (eveningReminderTimeout) {
    clearTimeout(eveningReminderTimeout);
    eveningReminderTimeout = null;
  }
}

// Initialize notifications based on settings
export function initializeNotifications(): void {
  const settings = getNotificationSettings();
  const permission = getNotificationPermission();
  
  if (permission !== 'granted') {
    stopAllReminders();
    return;
  }
  
  // Water reminders
  if (settings.waterReminders) {
    startWaterReminders(settings.reminderIntervalHours);
  } else {
    stopWaterReminders();
  }
  
  // Morning medication
  if (settings.medicationMorning) {
    scheduleMorningReminder();
  } else {
    cancelMorningReminder();
  }
  
  // Evening medication
  if (settings.medicationEvening) {
    scheduleEveningReminder();
  } else {
    cancelEveningReminder();
  }
}

export function stopAllReminders(): void {
  stopWaterReminders();
  cancelMorningReminder();
  cancelEveningReminder();
}

// Schedule appointment reminder (to be called when appointments are loaded)
export function scheduleAppointmentReminder(
  appointmentId: string,
  title: string,
  date: string,
  time: string
): void {
  const settings = getNotificationSettings();
  if (!settings.appointmentReminders) return;
  
  const permission = getNotificationPermission();
  if (permission !== 'granted') return;
  
  const appointmentDate = new Date(`${date}T${time}`);
  const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24h before
  
  const now = new Date();
  if (reminderDate <= now) return; // Already passed
  
  const delay = reminderDate.getTime() - now.getTime();
  
  setTimeout(() => {
    showNotification('📅 RDV demain', {
      body: `N'oubliez pas votre rendez-vous : ${title}`,
      tag: `appointment-${appointmentId}`,
    });
  }, delay);
}

// Notify when kick count goal is reached
export function notifyKickGoalReached(count: number): void {
  showNotification('👶 Objectif mouvements atteint !', {
    body: `${count} mouvements enregistrés. Bébé est actif aujourd'hui !`,
    tag: 'kick-goal',
  });
}

// Notify water goal reached
export function notifyWaterGoalReached(): void {
  showNotification('💧 Objectif hydratation atteint !', {
    body: 'Bravo ! Vous avez atteint votre objectif de 2L aujourd\'hui !',
    tag: 'water-goal',
  });
}
