import React, { useState } from "react";
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
} from "@/src/components/ui/alert-dialog";
import { toast } from "sonner";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { ServerCrash } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCluster } from "@/src/actions/motatios/createCluster";
import { queryClient } from "@/src/providers/QueryClientProvider";

export const BridgeOne = () => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Informe um nome para o cluster!");
      return;
    }

    try {
      setLoading(true);
      const result = await createCluster(name) as any;

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Computador conectado com sucesso!");
      setShowConnectionModal(false);
      queryClient.invalidateQueries({ queryKey: ['GetCluster'] });

      // const queryParams = new URLSearchParams({ service: result.name });
      // router.push(`/${result.type}/${result.id}?${queryParams.toString()}`);
    } catch (err) {
      console.error("Erro ao salvar serviço", err);
      toast.error("Erro inesperado ao salvar serviço!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ServerCrash size={16} />
          Novo Cluster
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md z-50">
        <AlertDialogHeader>
          <AlertDialogTitle>Criar Novo Cluster</AlertDialogTitle>
          <AlertDialogDescription>
            Novo agrupamento de dispositivos
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="cluster-name">Nome do cluster</label>
          <Input
            id="cluster-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cluster"
            required
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={loading}>
            {loading ? "Conectando..." : "Conectar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
