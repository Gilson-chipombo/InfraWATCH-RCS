"use client";

import { useAuth } from "@/src/hooks/useAuth";
import Loading from "@/src/components/layouts/Loading";
import HeaderPage from "@/src/components/layouts/header-page/header-page";
import SSH_gen from "../../(private)/ssh/ssh_gen";

export default function Dashboard() {
  const { status, user } = useAuth();

  if (status === "unauthenticated") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-xl shadow text-red-600 font-medium">
          Você precisa estar logado para acessar o Dashboard.
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <HeaderPage
        menuNav={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Terminal" },
        ]}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
          <SSH_gen />
        </div>
      </div>
    </main>
  );
}
