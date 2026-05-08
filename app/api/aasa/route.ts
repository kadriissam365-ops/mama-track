import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-static";

const TEAM_ID = "XY3HA7Y8HZ";
const BUNDLE_ID = "fr.mamatrack.app";
const APP_ID = `${TEAM_ID}.${BUNDLE_ID}`;

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: APP_ID,
        paths: [
          "/invite",
          "/invite/*",
          "/auth/callback",
          "/auth/callback/*",
        ],
      },
    ],
  },
  webcredentials: {
    apps: [APP_ID],
  },
};

export function GET() {
  return NextResponse.json(AASA, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
