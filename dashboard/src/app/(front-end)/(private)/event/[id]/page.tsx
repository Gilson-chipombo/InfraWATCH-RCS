"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useParams, useSearchParams } from "next/navigation";
import Loading from "@/src/components/layouts/Loading";
import HeaderPage from "@/src/components/layouts/header-page/header-page";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { SnmpMessage } from "@/src/types/interfaces";
import { DashboardContent } from "@/src/components/routes/event/dashboard";
import { useQuery } from "@tanstack/react-query";
import { getMetricByid } from "@/src/actions/querys/getMetricSNMP";
import { transformApiToSocket } from "@/config/uitl1";

export default function Dashboard() {
  const params = useParams();
  const url = useSearchParams();

  const id = params.id as string;
  const target = url.get("target");

  const { status } = useAuth();

  const [evento, setEvento] = useState<SnmpMessage | undefined>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("evento-cache");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          localStorage.removeItem("evento-cache");
        }
      }
    }
    return undefined;
  });

  const [logs, setLogs] = useState<SnmpMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStaus, setSocketStaus] = useState<number>(-1);

  const local = (novoEvento: any) => {
    console.log(novoEvento);

    // Salva no localStorage apenas se ainda não existir
    if (typeof window !== "undefined" && !localStorage.getItem("evento-cache")) {
      localStorage.setItem("evento-cache", JSON.stringify(novoEvento));
    }

    setLogs((prev) => {
      const eventoComIndex = { ...novoEvento };
      return [...prev, eventoComIndex];
    });

    setEvento(novoEvento);
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["metric", id],
    queryFn: () => getMetricByid(id).then(transformApiToSocket),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setEvento(data);
      local(data);
    }
  }, [data]);

  useEffect(() => {
    if (!target) {
      toast.warning("target nao informado");
      return;
    }

    const url = process.env.NEXT_PUBLIC_MONITORING_URL;
    const socketInstance = io(url!, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Conectado ao servidor:", socketInstance.id);
      setSocketStaus(1);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Erro ao conectar:", err.message);
      toast.error("Erro de conexão com servidor de monitoramento");
      setSocketStaus(0);
    });

    socketInstance.on("connect_timeout", () => {
      console.error("Timeout na conexão");
      toast.error("Timeout de conexão com servidor de monitoramento");
      setSocketStaus(0);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Desconectado:", reason);
      toast.warning(`Desconectado do servidor (${reason})`);
      setSocketStaus(0);
    });

    socketInstance.on("snmpService", (msg: SnmpMessage) => {
      if (msg.ip === target) {
        local({
          type: "snmp",
          ip: msg.ip,
          data: msg,
        });
      }
    });

    return () => {
      socketInstance.disconnect();
      setSocketStaus(0);
    };
  }, [target]);

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
          { label: "events" },
          { label: url.get("type") || "dsds" },
          { label: target || "" },
        ]}
      />

      <div className="p-4 border-t relative bg-gradient-to-br ">
        {/* Só mostra o overlay se não tiver evento e nem cache no localStorage */}
        {!evento && !localStorage.getItem("evento-cache") && (
          <div className="absolute inset-0 z-10 flex justify-center items-center bg-[#000000dc] text-white">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <h1 className="text-lg font-medium">Coletando métricas...</h1>
              <p className="text-sm text-purple-200">Aguarde enquanto os dados são carregados</p>
            </div>
          </div>
        )}

        <DashboardContent socketStatus={socketStaus} logs={logs} url={url} evento={evento} />
      </div>
    </main>
  );
}
