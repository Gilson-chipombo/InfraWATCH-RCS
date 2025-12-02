'use client'

import { cn } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getServiceById } from "@/src/actions/querys/getLocalservicesByID";
import { useQuery } from "@tanstack/react-query";
import { getComputerInfo } from "@/src/actions/querys/getComputerInfo";
import dynamic from "next/dynamic";
import Overview from "./tabs/overview";
import Network from "./tabs/network";
import Process from "./tabs/process";
import SettingPage from "./tabs/setting";
import { ErrorState } from "@/src/components/layouts/ErrorState";
import Docker from "./tabs/docker";
import DockerPs from "./tabs/process";
import DockerProcess from "./tabs/process";
import { queryClient } from "@/src/providers/QueryClientProvider";

type DatabaseProps = { id: string; className?: string };

const SSH_Web_Term = dynamic(() => import('./tabs/terminal'), { ssr: false });

export default function Server({ id, className }: DatabaseProps) {
  const [showLogo, setShowLogo] = useState(false);

  const { isLoading, error, data: service } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["serviceServer", "docker", id] });
    queryClient.invalidateQueries({ queryKey: ["serviceServer", "docker-ps", id] });

    const handleScroll = () => setShowLogo(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) return <p>Carregando serviço...</p>;
  if (error instanceof Error) return <p>Erro: {error.message}</p>;

  return (
    <Tabs defaultValue="integrations" className={cn("w-full space-y-0 gap-0", className)}>
      <div className="sticky top-0 z-10 flex justify-between bg-card border-b px-4 sm:px-8 max-w-full overflow-y-hidden overflow-x-auto no-scrollbar">
        <TabsList className="flex bg-card p-0 border-b-0 py-6 items-center gap-3">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              showLogo ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            <Image
              src="/logo.png"
              width={30}
              height={30}
              alt="logo"
              className="brightness-100 contrast-75 dark:brightness-[10]"
            />
          </div>
          <TabsTrigger value="integrations" className="tabStyle">Terminal</TabsTrigger>
          {/* <TabsTrigger value="overview" className="tabStyle">Overview</TabsTrigger> */}
          <TabsTrigger value="projects" className="tabStyle">Dockers</TabsTrigger>
          <TabsTrigger value="process" className="tabStyle">Processos</TabsTrigger>
          <TabsTrigger value="settings" className="tabStyle">Definições</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="p-4">
        {service?.Key_ssh?.id && service.host && service.port && service.user ? (
          <Overview service={service as any} />
        ) : (
          <ErrorState
            code="SSH-001"
            title="Conexão SSH não configurada"
            description="Você precisa configurar a chave SSH, host, porta e usuário antes de acessar o terminal remoto."
            doc="/docs"
            onRetry={() => window.location.reload()}
          />
        )}
      </TabsContent>

      <TabsContent value="projects" className="h-full p-4">
        {service?.Key_ssh?.id && service.host && service.port && service.user ? (
          <Docker service={service as any} />
        ) : (
          <ErrorState
            code="SSH-001"
            title="Conexão SSH não configurada"
            description="Você precisa configurar a chave SSH, host, porta e usuário antes de acessar o terminal remoto."
            doc="/docs"
            onRetry={() => window.location.reload()}
          />
        )}
      </TabsContent>

      <TabsContent value="integrations" className="h-full">
        {service?.Key_ssh?.id && service.host && service.port && service.user ? (
          <SSH_Web_Term service={service as any} />
        ) : (
          <ErrorState
            code="SSH-001"
            title="Conexão SSH não configurada"
            description="Você precisa configurar a chave SSH, host, porta e usuário antes de acessar o terminal remoto."
            doc="/docs"
            onRetry={() => window.location.reload()}
          />
        )}
      </TabsContent>

      <TabsContent value="process" className="p-4">
        {service?.Key_ssh?.id && service.host && service.port && service.user ? (
          <DockerProcess service={service as any} />
        ) : (
          <ErrorState
            code="SSH-001"
            title="Conexão SSH não configurada"
            description="Você precisa configurar a chave SSH, host, porta e usuário antes de acessar o terminal remoto."
            doc="/docs"
            onRetry={() => window.location.reload()}
          />
        )}
      </TabsContent>

      <TabsContent value="settings" className="p-4">
        <SettingPage service={service as any} />
      </TabsContent>
    </Tabs>
  );
}
