'use client'

import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Dashboard from "./(front-end)/(private)/dashboard/page";
import Loading from "../components/layouts/Loading";

export default function App() {
  const { status, user, requireAuth } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  if (status === "loading") {
    return <Loading />;
  }

  if (!user) return null;

  return <Dashboard />;
}
