// App Store Connect API helper.
// Loads .env.apple.local + .secrets/*.p8 and exposes a fetch-like client.
// Usage: import { asc } from './scripts/asc.mjs'; await asc('/v1/apps');

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(repoRoot, ".env.apple.local");
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const privateKey = fs.readFileSync(path.join(repoRoot, env.APP_STORE_CONNECT_PRIVATE_KEY_PATH), "utf8");

function token() {
  return jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "20m",
    audience: "appstoreconnect-v1",
    issuer: env.APP_STORE_CONNECT_ISSUER_ID,
    header: { alg: "ES256", kid: env.APP_STORE_CONNECT_KEY_ID, typ: "JWT" },
  });
}

export async function asc(pathOrUrl, init = {}) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `https://api.appstoreconnect.apple.com${pathOrUrl}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, body: json };
}

export const config = {
  bundleId: env.APP_BUNDLE_ID,
  appName: env.APP_NAME,
};
