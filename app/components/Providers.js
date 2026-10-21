"use client";

import { SessionProvider } from "next-auth/react";
import AuthWatcher from "./AuthWatcher";

export function Providers({ children }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false} refetchInterval={15}>
      <AuthWatcher />
      {children}
    </SessionProvider>
  );
}
