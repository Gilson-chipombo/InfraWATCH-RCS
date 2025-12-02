'use client'

import { useEvent } from "@/src/hooks/useEvent";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GetServices } from "@/src/actions/querys/getServices";
import { ServicesProps } from "@/src/types/interfaces";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "../../../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Globe, HouseWifi, MonitorUpIcon, PlusCircle, TentTree } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import PingMetricsTable from "./subTabs/events/tables/PingMetricsTable";
import HttpMetricsTable from "./subTabs/events/tables/HttpMetricsTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import { Card } from "@/src/components/ui/card";
import { useTheme } from "next-themes";
import { cn } from "@/src/lib/utils";
import { getSession } from "next-auth/react";
import SnmpMetricsTable from "./subTabs/events/tables/SnmpMetricsTable";

export default function Events() {
  const router = useRouter();
  const { evento, socketEnabled, toggleSocket } = useEvent();
  const { theme } = useTheme();

  const { isLoading, error, data: services } = useQuery<ServicesProps[]>({
    queryKey: ["GetServices"],
    queryFn: GetServices,
  });

  async function handleAddService(formData: FormData) {
    const session = await getSession();
    if (!session?.user?.id) {
      alert("Usuário não logado");
      return;
    }

    const ownerId = session.user.id;

    const payload = {
      name: formData.get("name"),
      type: formData.get("type"),
      target: formData.get("target"),
      contacts: [
        {
          channel: formData.get("contacts[0].channel"),
          to: formData.get("contacts[0].to"),
          level: Number(formData.get("contacts[0].level")),
          active: formData.get("contacts[0].active") === "on",
        },
      ],
    };

    const url = process.env.NEXT_PUBLIC_MONITORING_URL
    const res = await fetch(`${url}/api/addServices/${ownerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erro ao adicionar serviço");

    const newService = await res.json();
    alert("Serviço adicionado com sucesso!");
  }

  return (
    <div className="flex w-full h-[calc(100vh-70px-49px)]">
      <ResizablePanelGroup direction="horizontal" className="w-full gap-0">
        <ResizablePanel defaultSize={25} className="border-r">
          {/* Lista de serviços */}
          <header className="border-b flex justify-between items-center h-[60px] px-2">
            <AlertDialog>
              <AlertDialogTrigger className="flex gap-2 items-center border bg-muted p-2 rounded-md hover:bg-background cursor-pointer">
                <PlusCircle size={15} />
                <span className="text-sm">Adicionar evento</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Adicionar Serviço</AlertDialogTitle>
                  <form
                    className="flex flex-col gap-3 p-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      await handleAddService(formData); // chama sua função
                    }}
                  >
                    {/* Nome do serviço */}
                    <Input name="name" placeholder="Service name" required />

                    {/* Tipo do serviço */}
                    <select
                      name="type"
                      className="border rounded-md p-2"
                      defaultValue="HTTP"
                      required
                    >
                      <option value="HTTP">HTTP</option>
                      <option value="PING">PING</option>
                      <option value="SNMP">SNMP</option>
                    </select>

                    {/* Target */}
                    <Input name="target" placeholder="Target (URL, IP, etc)" required />

                    {/* Contatos */}
                    <div className="flex flex-col gap-2 border rounded-md p-2">
                      <span className="text-sm font-medium">Contatos de Alerta</span>

                      <div className="flex flex-col gap-2">
                        <Input name="contacts[0].channel" placeholder="Canal (email, slack...)" />
                        <Input name="contacts[0].to" placeholder="Destino (ex: email@dominio.com)" />
                        <Input
                          name="contacts[0].level"
                          placeholder="Nível 1"
                          type="number"
                          min={1}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="contacts[0].active" defaultChecked />
                          Ativo
                        </label>
                      </div>
                    </div>

                    {/* Botão Salvar dentro do formulário */}
                    <Button type="submit" className="mt-2 w-full">
                      Salvar
                    </Button>
                  </form>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>


            </AlertDialog>
          </header>

          <div className="flex flex-col gap-2 p-1">
            {isLoading ? (
              [...Array(7)].map((_, i) => (
                <div key={i} className="w-full h-12 rounded-md bg-muted animate-pulse" />
              ))
            ) : error instanceof Error ? (
              <p className="w-full bg-red-900 text-white rounded-md p-4">{error.message}</p>
            ) : (
              services?.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "relative p-2 gap-0 rounded shadow-none",
                    theme == "dark" ? "" : "bg-muted"
                  )}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.target}</span>
                  {item.type.toUpperCase() !== "SNMP" && (
                    <div className="absolute bg-background rounded-md top-2 right-2 flex py-1 px-2  border">
                      <span className="text-[9px]">{item.type}</span>
                    </div>
                  )}

                  {item.type.toUpperCase() === "SNMP" && (
                    <div className="absolute bg-[#fffff] rounded-sm top-4 right-2 flex py-1 px-2 border">
                      <button
                        className="text-sm font-medium text-blue-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/event/${item.id}?target=${item.target}&name=${item.name}&type=${item.type.toLowerCase()}`
                          );
                        }}
                      >
                        Ver dashboard
                      </button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={75} className="gap-0">
          <Tabs defaultValue="http">
            <TabsList className="px-4 border-b h-[60px]  flex justify-between items-center bg-background rounded-none w-full">
              <div className="flex items-center gap-3">
                <div className="flex flex-row items-center justify-center ml-2">
                  <span className="text-sm w-[120px]">Filter Service</span>
                  <Input placeholder="" />
                </div>
                <div className="flex gap-2">
                  <TabsTrigger value="http" className="px-4"><Globe /> HTTP</TabsTrigger>
                  <TabsTrigger value="ping" className="px-4"><MonitorUpIcon /> ICMP</TabsTrigger>
                  <TabsTrigger value="snmp" className="px-4"><HouseWifi /> SNMP</TabsTrigger>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleSocket}>
                  {!socketEnabled ? "Ativar Live Metric" : "Desativar Live Metric"}
                </Button>
              </div>
            </TabsList>

            {socketEnabled ? (
              <>
                <TabsContent value="http" className="max-h-[calc(100vh-70px-48px-60px)] p-0 overflow-auto gap-0">
                  <HttpMetricsTable evento={evento} />
                </TabsContent>
                <TabsContent value="ping" className="max-h-[calc(100vh-70px-49px-60px)] h-full overflow-auto">
                  <PingMetricsTable evento={evento} />
                </TabsContent>
                <TabsContent value="snmp" className="max-h-[calc(100vh-70px-49px-60px)] h-full overflow-auto">
                  <SnmpMetricsTable evento={evento} />
                </TabsContent>
              </>
            ) : (
              <div className="p-4 w-full h-[calc(100vh-70px-48px-60px)] gap-4 flex flex-col justify-center items-center">
                <TentTree size={200} className="text-border" />
                <span className="text-border">Iniciar listing de eventos e metricas</span>
                <Button variant="outline" onClick={toggleSocket}>Ativar Live Metric</Button>
              </div>
            )}
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
