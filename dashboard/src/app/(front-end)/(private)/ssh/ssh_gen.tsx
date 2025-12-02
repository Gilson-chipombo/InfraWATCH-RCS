"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getKeys } from "@/src/actions/querys/getKeys";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Loading from "@/src/components/layouts/Loading";

export interface SSHKey {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
  updatedAt: string;
}

export default function SSH_gen() {
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSshKeyId, setSelectedSshKeyId] = useState<string>("");
  const [newSshKeyName, setNewSshKeyName] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const { isPending, error, data } = useQuery<SSHKey[]>({
    queryKey: ["sshKeys"],
    queryFn: getKeys,
  });

  if (isPending) return "carregando...";
  if (error) return <span>Erro ao carregar chaves SSH</span>;
  if (status === "unauthenticated") return <span>Você precisa estar logado.</span>;
  if (status === "loading") return <Loading />;

  const handleGenerateSSHKey = async () => {
    if (!newSshKeyName.trim()) {
      toast.error("Por favor, informe um nome para a chave SSH");
      return;
    }

    setIsGeneratingKey(true);
    try {
      const res = await fetch("/api/ssh-key?name=" + encodeURIComponent(newSshKeyName), {
        method: "GET",
      });

      if (!res.ok) {
        toast.error("Erro ao gerar chave SSH");
        return;
      }

      const keyPair = await res.json();

      if (keyPair.success) {
        queryClient.invalidateQueries({ queryKey: ["sshKeys"] });
        setSelectedSshKeyId(keyPair.id);
        setNewSshKeyName("");
        toast.success("Chave SSH gerada com sucesso!");
      } else {
        toast.info("erro ao gerar chave SSH");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao gerar chave SSH");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-6 overflow-y-auto bg-background">
      {/* Header com título e botão */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Suas chaves SSH
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Nova chave SSH
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar nova chave SSH</DialogTitle>
              <DialogDescription>
                Preencha o nome da chave SSH que deseja criar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome da chave</label>
              <Input
                value={newSshKeyName}
                onChange={(e) => setNewSshKeyName(e.target.value)}
                placeholder="ex: servidor-prod"
              />
            </div>

            <DialogFooter>
              <Button 
                onClick={handleGenerateSSHKey} 
                disabled={isGeneratingKey}
              >
                {isGeneratingKey ? "Gerando..." : "Criar chave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de chaves SSH */}
      <div className="flex-1 overflow-y-auto">
        {data && data.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((key) => (
              <li
                key={key.id}
                className={`p-4 border rounded-lg text-sm transition ${
                  selectedSshKeyId === key.id 
                    ? "bg-muted border-border" 
                    : "bg-card border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{key?.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Atualizada em: {key?.updatedAt &&
                        new Date(key.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fingerprint</p>
                      <code className="block text-xs font-mono bg-muted p-2 rounded break-all">
                        58e8cdb31a6c3fcf7efebc77t29f57cd5:20a8
                      </code>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs ml-2"
                          onClick={() => setSelectedSshKeyId(key.id)}
                        >
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{key?.name}</DialogTitle>
                          <DialogDescription>
                            Detalhes completos da sua chave SSH
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Chave pública:
                            </p>
                            <code className="block text-xs p-3 bg-muted rounded break-all font-mono">
                              {key?.publicKey}
                            </code>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              Fingerprint:
                            </p>
                            <code className="block text-xs p-2 bg-muted rounded break-all font-mono">
                              58e8cdb31a6c3fcf7efebc77t29f57cd5:20a8
                            </code>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Criada em: {key?.createdAt &&
                                new Date(key.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(key.publicKey);
                                toast.info("Chave SSH copiada!");
                              }}
                            >
                              Copiar chave
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg border border-dashed border-border p-6 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma chave SSH</h3>
            <p className="text-muted-foreground text-sm">
              Comece criando sua primeira chave SSH
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
