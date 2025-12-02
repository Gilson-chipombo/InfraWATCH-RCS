"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import Loading from "@/src/components/layouts/Loading";
import DashboardPage from "@/src/components/routes/dashboard";
import HeaderPage from "@/src/components/layouts/header-page/header-page";

export default function Dashboard() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            width={200}
            height={200}
            alt="logo"
            className="brightness-1 contrast-75 dark:brightness-[10] cursor-pointer"
          />
          <h1>InfraWatch</h1>
          <Button variant={"outline"} onClick={() => window.location.reload()} className="w-full mt-6">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return <Loading />
  }

  return (
    <main className="h-screen">
      <HeaderPage />
      <DashboardPage data={null} />
    </main>
  );
}
