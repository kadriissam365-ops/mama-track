#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push notifications.
 *
 * Usage:
 *   node scripts/generate-vapid-keys.js
 *
 * The script prints the key pair and the environment variables you need to set
 * in your .env.local (or hosting provider):
 *
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
 *   VAPID_PRIVATE_KEY=<private key>
 *   VAPID_SUBJECT=mailto:contact@mamatrack.app
 *
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY is exposed to the browser (used by the Push API).
 * VAPID_PRIVATE_KEY must stay secret (used only server-side by web-push).
 * VAPID_SUBJECT must be a mailto: or https: URL identifying the application.
 */

const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("=== VAPID Keys Generated ===\n");
console.log("Public Key:");
console.log(vapidKeys.publicKey);
console.log("\nPrivate Key:");
console.log(vapidKeys.privateKey);
console.log("\n=== Add these to your .env.local ===\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:contact@mamatrack.app");
console.log(
  "\nNote: VAPID_PRIVATE_KEY must remain secret. Never commit it to version control."
);
