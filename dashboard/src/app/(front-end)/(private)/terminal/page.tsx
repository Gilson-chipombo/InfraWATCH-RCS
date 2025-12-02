"use client";

import HeaderPage from "@/src/components/layouts/header-page/header-page";
import Loading from "@/src/components/layouts/Loading";
import { useAuth } from "@/src/hooks/useAuth";
import dynamic from "next/dynamic";

const XTerminal = dynamic(() => import("@/src/components/layouts/header-page/terminal/terminal"), {
  ssr: false,
});

export default function Dashboard() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <span>Você precisa estar logado.</span>;
  }

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <main className="h-screen">
      <HeaderPage
        menuNav={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Terminal" },
        ]}
      />
      <XTerminal />
    </main>
  );
}
