"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

import QueryProvider from "@/contexts/QueryProvider";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </QueryProvider>
  );
}
