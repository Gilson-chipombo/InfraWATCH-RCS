'use client'

import { cn } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "@/src/actions/querys/getLocalservicesByID";
import { getGithubEvents } from "@/src/actions/querys/getGithubEvents";
import Webhook from "./tabs/webhook";
import Github from "./tabs/github";
import SettingPage from "./tabs/setting";
import Scripts from "./tabs/scripts";
import Overview from "./tabs/overview";

type DatabaseProps = { id: string; className?: string; };

export default function WebService({ id, className }: DatabaseProps) {
  const [showLogo, setShowLogo] = useState(false);

  // pega service
  const {
    isLoading: isLoadingService,
    error: errorService,
    data: service,
  } = useQuery<any>({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });


  useEffect(() => {
    const handleScroll = () => {
      setShowLogo(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoadingService) return <p>Carregando serviço...</p>;
  if (errorService instanceof Error) return <p>Erro: {errorService.message}</p>;

  return (
    <Tabs defaultValue="overview" className={cn("w-full space-y-0 gap-0", className)}>
      <div className="sticky top-0 z-10 flex justify-between bg-card border-b px-4 sm:px-8 max-w-full overflow-y-hidden overflow-x-auto no-scrollbar">
        <TabsList className="flex bg-card p-0 border-b-0 py-6 items-center gap-3">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              showLogo
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            <Image
              src="/logo.png"
              width={30}
              height={30}
              alt="logo"
              className="brightness-1 contrast-75 dark:brightness-[10]"
            />
          </div>

          <TabsTrigger value="overview" className="tabStyle">
            Overview
          </TabsTrigger>
          <TabsTrigger value="scripts" className="tabStyle">
            Scripts
          </TabsTrigger>
          <TabsTrigger value="github" className="tabStyle">
            Github
          </TabsTrigger>
          <TabsTrigger value="webhook" className="tabStyle">
            webhooks
          </TabsTrigger>
          <TabsTrigger value="settings" className="tabStyle">
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <Overview service={service} />
      </TabsContent>

      <TabsContent value="scripts">
        <Scripts service={service} />
      </TabsContent>

      <TabsContent value="github" className="h-full gap-0">
        <Github service={service} id={id} />
      </TabsContent>

      <TabsContent value="integrations"></TabsContent>

      <TabsContent value="webhook">
        <Webhook service={service as any} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingPage service={service} />
      </TabsContent>
    </Tabs>
  );
}
