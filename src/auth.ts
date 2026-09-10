import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import * as schema from "./db/schema";

const betterAuthInstance = betterAuth({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [nextCookies()],
  onAPIError: {
    errorURL: "/error",
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      alertNotification: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      pushNotification: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      expoPushToken: {
        type: "string",
        required: false,
      },
      smsNotification: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      isInSchool: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      profileImage: {
        type: "string",
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId:
        process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const domain = process.env.AUTH_EMAIL_DOMAIN;
          if (domain && !user.email.endsWith(domain)) {
            throw new APIError("FORBIDDEN", {
              message: "AccessDenied",
            });
          }
          return {
            data: {
              ...user,
              profileImage: user.image || null,
            },
          };
        },
      },
    },
  },
});

export const auth = Object.assign(async () => {
  return await betterAuthInstance.api.getSession({
    headers: await headers(),
  });
}, betterAuthInstance);

export type AuthSession = typeof betterAuthInstance.$Infer.Session;
export type AuthUser = typeof betterAuthInstance.$Infer.Session.user;
