'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { HttpWatch, PingWacth, SnmpWatch } from "@/src/types/interfaces";

type EventType = any;
interface EventContextProps {
  evento: EventType[];
  socketEnabled: boolean;
  toggleSocket: () => void;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [evento, setEvento] = useState<EventType[]>([]);
  const [socketEnabled, setSocketEnabled] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const local = (novoEvento: EventType) => {
    console.log(novoEvento);

    setEvento((prev) => {
      const index = prev.length + 1;
      const eventoComIndex = { ...novoEvento, index };

      return [...prev, eventoComIndex];
    });

    toast.info(`Novo evento recebido ${novoEvento.data?.type}`);
  };


  useEffect(() => {
    if (!socketEnabled) return;

    const url = process.env.NEXT_PUBLIC_MONITORING_URL;
    const socketInstance = io(url, { transports: ["websocket"] });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Conectado ao servidor 2:", socketInstance.id);
    });

    socketInstance.on("pingService", (msg: PingWacth) => {
      local({
        type: "ping",
        status: msg.status,
        average_response_ms: msg.average_response_ms,
        maximum_response_ms: msg.maximum_response_ms,
        minimum_response_ms: msg.minimum_response_ms,
        packets_received: msg.packets_received,
        packets_transmitted: msg.packets_transmitted,
        percent_packet_loss: msg.percent_packet_loss,
        standard_deviation_ms: msg.standard_deviation_ms,
        data: msg,
      });
    });

    socketInstance.on("httpService", (msg: HttpWatch) => {
      local({
        type: "http",
        status: msg.status,
        httpStatus: msg.httpStatus,
        ip: msg.ip,
        sizeBytes: msg.sizeBytes,
        dnsMs: msg.dnsMs,
        connectAndDownloadMs: msg.connectAndDownloadMs,
        totalMs: msg.totalMs,
        data: msg,
      });
    });

    socketInstance.on("snmpService", (msg: any) => {
      console.log(msg)
      console.log(msg.data)
      local({
        type: "snmp",
        ip: msg.ip,
        data: msg,
      });
    });

    socketInstance.on("disconnect", () =>
      console.log("Desconectado do servidor")
    );

    return () => {
      socketInstance.disconnect();
    };
  }, [socketEnabled]);

  const toggleSocket = () => setSocketEnabled((prev) => !prev);

  return (
    <EventContext.Provider value={{ evento, socketEnabled, toggleSocket }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent deve ser usado dentro de EventProvider");
  }
  return context;
}
