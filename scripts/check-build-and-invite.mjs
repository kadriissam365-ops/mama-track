#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createPrivateKey, createSign } from "node:crypto";

const KEY_ID = "G2282P28Z7";
const ISSUER_ID = "8e768563-5f78-4d4a-96b5-5faa8ec45768";
const KEY_PATH = `${process.env.HOME}/Documents/mama-track/.secrets/AuthKey_${KEY_ID}.p8`;
const APPLE_ID = "kadriissam365@gmail.com";
const FIRST_NAME = "Issam";
const LAST_NAME = "KADRI";
const APP_BUNDLE_ID = "fr.mamatrack.app";

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function makeJWT() {
  const header = { alg: "ES256", kid: KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1200,
    aud: "appstoreconnect-v1",
  };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const signingInput = `${h}.${p}`;
  const keyPem = readFileSync(KEY_PATH, "utf8");
  const key = createPrivateKey({ key: keyPem, format: "pem" });
  const signer = createSign("SHA256");
  signer.update(signingInput);
  signer.end();
  const der = signer.sign({ key, dsaEncoding: "ieee-p1363" });
  const sig = b64url(der);
  return `${signingInput}.${sig}`;
}

async function asc(method, path, body) {
  const jwt = makeJWT();
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${method} ${path}`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`ASC API ${res.status}`);
  }
  return data;
}

(async () => {
  // 1. Find the app
  console.log("→ Looking up app", APP_BUNDLE_ID);
  const apps = await asc("GET", `/v1/apps?filter[bundleId]=${APP_BUNDLE_ID}`);
  if (!apps.data || apps.data.length === 0) {
    throw new Error(`No app found with bundleId ${APP_BUNDLE_ID}`);
  }
  const app = apps.data[0];
  const appId = app.id;
  console.log(`  app id=${appId} name="${app.attributes.name}"`);

  // 2. Find latest build
  console.log("→ Listing builds");
  const builds = await asc(
    "GET",
    `/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=5&include=preReleaseVersion`
  );
  if (!builds.data || builds.data.length === 0) {
    console.log("  no builds found");
    return;
  }
  const latest = builds.data[0];
  console.log(`  latest build id=${latest.id}`);
  console.log(`    version=${latest.attributes.version} (${latest.attributes.preReleaseVersion?.attributes?.version || "?"})`);
  console.log(`    processingState=${latest.attributes.processingState}`);
  console.log(`    uploadedDate=${latest.attributes.uploadedDate}`);
  console.log(`    expired=${latest.attributes.expired}`);
  if (latest.attributes.processingState !== "VALID") {
    console.log("\n⚠ Build not VALID yet — wait a few minutes and re-run.");
    return;
  }

  // 3. Find or create the App Store Connect Users beta group
  console.log("→ Listing beta groups");
  const groups = await asc(
    "GET",
    `/v1/betaGroups?filter[app]=${appId}&limit=50`
  );
  let internalGroup = groups.data.find(
    (g) => g.attributes.isInternalGroup === true
  );
  if (!internalGroup) {
    console.log("  no internal beta group, creating one");
    const created = await asc("POST", "/v1/betaGroups", {
      data: {
        type: "betaGroups",
        attributes: {
          name: "Internal Testers",
          publicLinkEnabled: false,
        },
        relationships: {
          app: { data: { type: "apps", id: appId } },
        },
      },
    });
    internalGroup = created.data;
  }
  console.log(`  internal group id=${internalGroup.id} name="${internalGroup.attributes.name}"`);

  // 4. Find or create beta tester (user)
  console.log("→ Looking up beta tester", APPLE_ID);
  const testers = await asc(
    "GET",
    `/v1/betaTesters?filter[email]=${encodeURIComponent(APPLE_ID)}`
  );
  let tester = testers.data?.[0];
  if (!tester) {
    console.log("  not yet a beta tester, creating");
    const created = await asc("POST", "/v1/betaTesters", {
      data: {
        type: "betaTesters",
        attributes: {
          email: APPLE_ID,
          firstName: FIRST_NAME,
          lastName: LAST_NAME,
        },
        relationships: {
          betaGroups: {
            data: [{ type: "betaGroups", id: internalGroup.id }],
          },
        },
      },
    });
    tester = created.data;
  } else {
    // Add to internal group if not already
    console.log(`  tester id=${tester.id}, ensuring group membership`);
    try {
      await asc(
        "POST",
        `/v1/betaGroups/${internalGroup.id}/relationships/betaTesters`,
        {
          data: [{ type: "betaTesters", id: tester.id }],
        }
      );
    } catch (e) {
      console.log("    (already in group, ignoring)");
    }
  }
  console.log(`  tester id=${tester.id}`);

  // 5. Associate the latest build with the internal group
  console.log("→ Linking build to internal group");
  try {
    await asc(
      "POST",
      `/v1/betaGroups/${internalGroup.id}/relationships/builds`,
      {
        data: [{ type: "builds", id: latest.id }],
      }
    );
    console.log("  linked");
  } catch (e) {
    console.log("    (already linked, ignoring)");
  }

  console.log("\n✓ Done. Issam should now receive a TestFlight invite email.");
  console.log("  Check inbox for kadriissam365@gmail.com.");
  console.log(`  Build version: ${latest.attributes.version}`);
})();
