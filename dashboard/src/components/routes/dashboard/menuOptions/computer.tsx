import { generateToken } from "@/config/uitl1";
import { ConnectToComputer } from "@/src/actions/motatios/connectToComputer";
import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Input } from "../../../ui/input";
import { Device } from "@/src/types/computer";
import { Button } from "../../../ui/button";
import { ServerCrash } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { createService } from "@/src/actions/motatios/createService";

export const ConnectToDevice = () => {
  const [token, setToken] = useState("");
  const [adbToken, setAdbToken] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const generatedToken = generateToken(16);
    setToken(generatedToken);
    const url = process.env.NEXT_PUBLIC_LINKER_URL_WS as string
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ token: generatedToken, type: "register" }));
    };
    socket.onmessage = (event) => {
      try {
        const { event: evt, data } = JSON.parse(event.data);
        if (evt === `deviceaccept/${generatedToken}`) {
          setDevice(data);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem do servidor:", error);
      }
    };
    socket.onclose = () => {
      console.log("Conexão WS fechada");
    };
    return () => {
      socket.close();
    };
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await ConnectToComputer({ adbToken, token });
    if (result.success) {
      toast.success(
        "Pedido enviado com sucesso! Aguarde a aprovação no dispositivo."
      );
    } else {
      toast.error("Erro ao enviar pedido: " + result.error);
    }
  };

  const handleSubmit = async  () => {
    try {
      const result = await createService({
        type: "computers",
        name: device?.user || "Dispositivo sem nome",
        password: device?.mytoken,
        host: device?.platform,
      }) as any;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Computador conectado com sucesso!");
      setShowConnectionModal(false);

      // Montar query params e redirecionar
      const queryParams = new URLSearchParams({
        service: result.name,
      });

      router.push(`/${result.type}/${result.id}?${queryParams.toString()}`);
    } catch (err) {
      console.error("Erro ao salvar serviço", err);
      toast.error("Erro inesperado ao salvar serviço!");
    }
  };

return (
  <AlertDialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
    <AlertDialogTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <ServerCrash size={16} />
        LinkDesk
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center justify-between">
          <span>Conexão</span>

        </AlertDialogTitle>
        <AlertDialogDescription>
          Configure a conexão com seu dispositivo
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div>
        <div>
          <form onSubmit={handleConnect} className="flex flex-col gap-2">
            <Input
              type="text"
              value={adbToken}
              disabled={device as any}
              onChange={(e) => setAdbToken(e.target.value)}
              placeholder="Token de dispositivo"
              required
            />
            {device && (
              <div className="flex flex-col gap-2">
                <Input value={device.platform} disabled />
                <Input value={device.version} disabled />
                <Separator />
                <Input value={device.user} />
              </div>
            )}
            {!device && <Button type="submit">Conectar</Button>}
          </form>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleSubmit}
          disabled={!device}
        >
          Conectar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
};
