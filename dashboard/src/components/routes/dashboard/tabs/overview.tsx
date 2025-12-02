"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/src/components/ui/command';
import { ResizablePanel, ResizablePanelGroup } from "../../../ui/resizable";
import PCStatus from "../tools/PCStatus";
import { Button } from "../../../ui/button";
import { Check, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";

import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

import { createService } from "@/src/actions/motatios/createService";
import { listServices } from "@/src/actions/querys/listServices";
import { ConnectToDevice } from "../menuOptions/computer";
import { getKeys } from "@/src/actions/querys/getKeys";
import Loading from "@/src/components/layouts/Loading";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Clusters from "../tools/clusters";

interface Service {
  id: string;
  name: string;
  type: string;
  dbType?: string;
  wsType?: string;
}

export default function Overview() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Estados
  const [openServicePopover, setOpenServicePopover] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serverConType, setServerConType] = useState("");
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "22",
    user: "",
    password: "",
    dbType: "",
    dbUrl: "",
    wsType: "",
    wsUrl: "",
    containerName: "",
    key_sshId: "",
    image: ""
  });

  // Query de serviços
  const { isLoading, error, data: services = [] } = useQuery({
    queryKey: ["listServices"],
    queryFn: listServices,
  });

  // Query de chaves SSH
  const { isPending, error: errorKeys, data: keys } = useQuery({
    queryKey: ["sshKeys"],
    queryFn: getKeys,
  });

  // Tipos de serviços
  const serviceTypes = [
    { value: "database", label: "Database", icon: "bx bxs-data" },
    { value: "web-services", label: "Web Services", icon: "bx bx-globe" },
    { value: "servers", label: "Servidores", icon: "bx bx-server" },
    { value: "containers", label: "Containers", icon: "bx bxl-docker" },
  ];

  // Helpers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceSelect = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    setOpenServicePopover(false);
    setShowServiceModal(true);
    setFormData({
      name: "",
      host: "",
      port: "22",
      user: "",
      password: "",
      dbType: "",
      dbUrl: "",
      wsType: "",
      wsUrl: "",
      containerName: "",
      key_sshId: "",
      image: ""
    });
  };

  const handleSaveService = async () => {
    if (!formData.name) {
      toast.error("O nome do serviço é obrigatório");
      return;
    }

    try {
      const serviceData = {
        type: selectedServiceType,
        name: formData.name,
        ...(selectedServiceType === "database" && {
          dbType: formData.dbType,
          dbUrl: formData.dbUrl,
        }),
        ...(selectedServiceType === "web-services" && {
          wsType: formData.wsType,
          wsUrl: formData.wsUrl,
        }),
        ...(selectedServiceType === "computers" && {
          password: formData.password,
        }),
        ...(selectedServiceType === "servers" && {
          host: formData.host,
          port: formData.port,
          username: formData.user,
          password: formData.password,
          key_sshId: formData.key_sshId,
        }),
        ...(selectedServiceType === "containers" && {
          containerName: formData.containerName,
          image: formData.image,
        }),
      };

      const result = await createService(serviceData) as any;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Serviço criado com sucesso!");
      setShowServiceModal(false);

      const queryParams = new URLSearchParams({
        service: result.name,
        ...(result.dbType ? { dbType: result.dbType } : {}),
      });

      router.push(`/${result.type}/${result.id}?${queryParams.toString()}`);
    } catch (err) {
      console.error("Erro ao salvar serviço", err);
      toast.error("Erro inesperado ao salvar serviço!");
    }
  };

  // Formulários
  const renderServiceForm = () => {
    switch (selectedServiceType) {
      case "database":
        return (
          <div className="space-y-4">
            <h2 className="font-semibold">Configurar Banco de Dados</h2>
            <Input
              placeholder="Nome do serviço"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Select
              value={formData.dbType}
              onValueChange={(value) => handleInputChange("dbType", value)}
            >
              <SelectTrigger><SelectValue placeholder="Selecione um banco de dados" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mongodb">MongoDB</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="postgres://user:pass@localhost:5432/dbname"
              value={formData.dbUrl}
              onChange={(e) => handleInputChange("dbUrl", e.target.value)}
            />
          </div>
        );

      case "web-services":
        return (
          <div className="space-y-4">
            <h2 className="font-semibold">Adicionar Web Service</h2>
            <Input
              placeholder="Nome do serviço"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Select
              value={formData.wsType}
              onValueChange={(value) => handleInputChange("wsType", value)}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Página Web</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="https://example.com"
              value={formData.wsUrl}
              onChange={(e) => handleInputChange("wsUrl", e.target.value)}
            />
          </div>
        );

      case "servers":
        return (
          <div className="space-y-4">
            <h2 className="font-semibold">Adicionar Servidor</h2>
            <Input
              placeholder="Nome do serviço"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              placeholder="192.168.0.10 ou exemplo.com"
              value={formData.host}
              onChange={(e) => handleInputChange("host", e.target.value)}
            />
            <Input
              placeholder="22"
              value={formData.port}
              onChange={(e) => handleInputChange("port", e.target.value)}
            />
            <Input
              placeholder="usuário"
              value={formData.user}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />

            <Select value={serverConType} onValueChange={setServerConType}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo de credencial" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ssh">SSH</SelectItem>
                <SelectItem value="grpc">Password</SelectItem>
              </SelectContent>
            </Select>

            {serverConType === "grpc" && (
              <Input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            )}

            {serverConType === "ssh" && (
              <Select
                value={formData.key_sshId}
                onValueChange={(value) => handleInputChange("key_sshId", value)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione uma chave SSH" /></SelectTrigger>
                <SelectContent>
                  {isPending && <SelectItem value="loading">Carregando...</SelectItem>}
                  {errorKeys && <SelectItem value="error">Erro ao carregar</SelectItem>}
                  {keys?.map((key) => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.name || key.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case "computers":
        return <ConnectToDevice />;

      case "containers":
        return (
          <div className="space-y-4">
            <h2 className="font-semibold">Adicionar Container</h2>
            <Input
              placeholder="Nome do serviço"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              placeholder="meu_container"
              value={formData.containerName}
              onChange={(e) => handleInputChange("containerName", e.target.value)}
            />
            <Input
              placeholder="nginx:latest"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
            />
          </div>
        );

      default:
        return <p className="text-gray-500">Selecione um serviço para configurar.</p>;
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <p>Erro ao carregar serviços: {(error as Error).message}</p>;

  return (
    <div className="flex sm:px-8 w-full">
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* Sidebar */}
        {!isMobile && (
          <ResizablePanel defaultSize={15} className="min-w-[200px]">
            <h1 className="py-5 font-semibold">{language.Dashboard.overview.text.services}</h1>
            <div className="my-1 space-y-4 px-2">
              {services.length === 0 ? (
                <p className="text-gray-500 text-sm">{language.Dashboard.overview.text.no_services}</p>
              ) : (
                Object.entries(
                  services.reduce((acc: Record<string, Service[]>, service) => {
                    if (!acc[service.type]) acc[service.type] = [];
                    acc[service.type].push(service as any);
                    return acc;
                  }, {})
                ).map(([type, group]) => (
                  <div key={type}>
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      {type}
                    </h2>
                    <div className="space-y-2">
                      {group.map((service) => {
                        const queryParams = new URLSearchParams({
                          service: service.name,
                          ...(service.dbType ? { dbType: service.dbType } : {}),
                        });
                        const serviceIcon =
                          serviceTypes.find((t) => t.value === service.type)?.icon ||
                          "bx bx-cube";

                        return (
                          <div
                            key={service.id}
                            onClick={() =>
                              router.push(`/${service.type}/${service.id}?${queryParams}`)
                            }
                            className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-sm">{service.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {service.type}
                                  {service.dbType && ` • ${service.dbType}`}
                                  {service.wsType && ` • ${service.wsType}`}
                                </p>
                              </div>
                              <i className={`${serviceIcon} text-lg`}></i>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ResizablePanel>
        )}

        {/* Painel principal */}
        <ResizablePanel defaultSize={85}>
          <div className="w-full p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-bold text-2xl">{language.Dashboard.overview.text.title}</h1>
                <p className="text-muted-foreground">{language.Dashboard.overview.text.subtitle}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <ConnectToDevice />
                <Popover open={openServicePopover} onOpenChange={setOpenServicePopover}>
                  <PopoverTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus size={16} />
                      {language.Dashboard.overview.button.add_service}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <Command>
                      <CommandInput placeholder="Buscar serviço..." />
                      <CommandList>
                        <CommandEmpty>{language.Dashboard.overview.text.no_services}</CommandEmpty>
                        <CommandGroup>
                          {serviceTypes.map((service) => (
                            <CommandItem
                              key={service.value}
                              value={service.value}
                              onSelect={() => handleServiceSelect(service.value)}
                              className="flex items-center gap-2"
                            >
                              <i className={service.icon}></i>
                              {service.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedServiceType === service.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Modal */}
            <AlertDialog open={showServiceModal} onOpenChange={setShowServiceModal}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {serviceTypes.find(s => s.value === selectedServiceType)?.label}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Configure os detalhes do novo serviço
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {renderServiceForm()}

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button onClick={handleSaveService}>Criar Serviço</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Monitoramento */}
            <div>
              <PCStatus />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
