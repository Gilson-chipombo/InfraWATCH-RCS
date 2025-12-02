"use client";

import { useSession, signIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    await nextAuthSignOut({ redirect: false });
    setIsSigningOut(false);
    router.push("/signing");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (status === "unauthenticated") {
      router.push("/signing");
    }
  }, [status, router]);

  return {
    user: session?.user ?? null,
    status, // 'loading' | 'authenticated' | 'unauthenticated'
    signIn,
    isSigningOut,
    signOut,
    isAuthenticated: status === "authenticated",
    requireAuth,
  };
}
