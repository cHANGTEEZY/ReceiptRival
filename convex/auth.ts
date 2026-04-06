import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { expo } from '@better-auth/expo'
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Deep-link origins for Better Auth CSRF / origin checks.
 * - `acme://` must match `expo.scheme` in app.json (`"acme"`).
 * - `exp://` is included because @better-auth/expo only adds it when NODE_ENV=development,
 *   while Convex always runs as production — Expo Go / dev client still sends exp:// sometimes.
 * Optional: set Convex env `BETTER_AUTH_TRUSTED_ORIGINS` to a comma-separated list for extras.
 */
function extraTrustedOriginsFromEnv(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Public Convex HTTP site (same host you use in EXPO_PUBLIC_CONVEX_SITE_URL). No trailing slash. */
function authBaseURL(): string | undefined {
  const raw =
    process.env.CONVEX_SITE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const baseURL = authBaseURL();
  return betterAuth({
    ...(baseURL ? { baseURL } : {}),
    // Async resolver so origins are merged reliably with the Expo plugin (see better-auth origin-check + plugin init).
    trustedOrigins: async () => {
      const extras = extraTrustedOriginsFromEnv();
      return [
        "acme://",
        "acme://*",
        "exp://",
        "exp://*",
        ...extras,
      ];
    },
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Expo and Convex plugins are required
      expo(),
      convex({ authConfig }),
    ],
  })
}
// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});