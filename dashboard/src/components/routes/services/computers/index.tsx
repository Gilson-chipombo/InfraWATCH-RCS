"use client";

import { cn } from "@/src/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getServiceById } from "@/src/actions/querys/getLocalservicesByID";
import { useQuery } from "@tanstack/react-query";
import { generateToken } from "@/config/uitl1";
import { Device } from "@/src/types/computer";
import Overview from "./tabs/overview";
import Network from "./tabs/network";
import InfraShell from "./tabs/infrashell";
import SettingPage from "./tabs/setting";
import { ErrorState } from "@/src/components/layouts/ErrorState";

type ComputerProps = { id: string; className?: string };

export default function Computer({ id, className }: ComputerProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [myself, setMyself] = useState("");
  const [token, setToken] = useState("");
  const [wsData, setWsData] = useState<any>({});

  const {
    isLoading,
    error,
    data: service,
  } = useQuery<any>({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });

  const { isLoading: isLoadingData, error: errorData, data: dataData } = useQuery<Device>({
    queryKey: ["cpu", id, token, myself],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_LINKER_URL
      const response = await fetch(`${url}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, myself, command: "#show" }),
      });
      if (!response.ok) {
        return null
      }
      return response.json();
    },
    enabled: !!id && !!service && !!token && !!myself,
  });

  useEffect(() => {
    const handleScroll = () => setShowLogo(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!service) return;
    const userToken = service?.password ?? "";
    const mytoken = generateToken(16);
    setMyself(mytoken);
    setToken(userToken);
  }, [service]);

  useEffect(() => {
    if (!myself || !token) return;

    const url = process.env.NEXT_PUBLIC_LINKER_URL_WS as string
    const socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      console.log("Conectado ao servidor WS");
      socket.send(JSON.stringify({ type: "register", token: myself }));
    });

    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.event === `info/${myself}`) {
          console.log("Info recebida:", msg.data);
        }

        if (msg.event === `response/${myself}`) {
          console.log("Resposta recebida 2:", msg.data?.stdout);
          setWsData(msg.data.stdout);
        }
      } catch (err) {
        console.error("Erro ao processar mensagem:", err);
      }
    });

    socket.onclose = () => console.log("WebSocket desconectado");
    socket.onerror = (err) => console.error("Erro WebSocket:", err);

    return () => socket.close();
  }, [myself, token]);

  if (isLoading) return <p>Carregando serviço...</p>;
  if (error instanceof Error) return <p>Erro: {error.message}</p>;

  if (isLoadingData) return <p>Carregando dados...</p>;
  if (errorData instanceof Error) return <p>Erro: {errorData.message}</p>;

  return (
    <div className="h-screen">
      <Tabs
        defaultValue="overview"
        className={cn("w-full space-y-0 gap-0", className)}
      >
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
              <Image src="/logo.png" width={30} height={30} alt="logo" />
            </div>
            <TabsTrigger value="overview" className="tabStyle">
              Overview
            </TabsTrigger>
            <TabsTrigger value="network" className="tabStyle">
              Network
            </TabsTrigger>
            <TabsTrigger value="infrashell" className="tabStyle">
              InfraShell
            </TabsTrigger>
            <TabsTrigger value="settings" className="tabStyle">
              Definições
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-4">
          {dataData == null ? (
            <ErrorState
              code="C00E2"
              title="Conexão cortada"
              description="Não foi possível estabelecer comunicação com o servidor. Verifique sua rede ou tente novamente mais tarde."
              onRetry={() => window.location.reload()}
              doc="/"
            />
          ) : (
            <Overview wsData={wsData} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="h-full p-4"></TabsContent>

        <TabsContent value="network" className="h-full p-4">
          {dataData == null ? (
            <ErrorState
              code="C00E2"
              title="Conexão cortada"
              description="Não foi possível estabelecer comunicação com o servidor. Verifique sua rede ou tente novamente mais tarde."
              onRetry={() => window.location.reload()}
              doc="/"
            />
          ) : (
            <Network wsData={wsData} />
          )}
        </TabsContent>

        <TabsContent value="infrashell" className="p-4">
          {dataData == null ? (
            <ErrorState
              code="C00E2"
              title="Conexão cortada"
              description="Não foi possível estabelecer comunicação com o servidor. Verifique sua rede ou tente novamente mais tarde."
              onRetry={() => window.location.reload()}
              doc="/"
            />
          ) : (
            <InfraShell className="h-full" data={service} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <SettingPage service={service} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
