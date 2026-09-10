"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function signInAction() {
  const res = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/dashboard",
    },
    headers: await headers(),
  });

  if (res && "url" in res && res.url) {
    redirect(res.url);
  }
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/signin");
}

export async function signOutRootAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
