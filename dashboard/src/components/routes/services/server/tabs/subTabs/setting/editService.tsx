"use client";

import { editService } from "@/src/actions/motatios/createService";
import { getKeys } from "@/src/actions/querys/getKeys";
import { SSHKey } from "@/src/app/(front-end)/(private)/ssh/ssh_gen";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { queryClient } from "@/src/providers/QueryClientProvider";
import { Service } from "@/src/types/interfaces";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function EditService({ service }: { service: Service }) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: service.name,
    port: service.port,
    host: service.host ?? "",
    user: service.user ?? "",
    key_sshId: service.Key_ssh?.id ?? "",
    password: service.password ?? "",
  });

  // Query de chaves SSH
  const { isPending, error: errorKeys, data: keys } = useQuery<SSHKey[]>({
    queryKey: ["sshKeys"],
    queryFn: getKeys,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, key_sshId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await editService(service.id, form);

      if (res.success) {
        toast.success("Serviço reconfigurado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["service", service.id] });
        setEditMode(false);
      } else {
        toast.error(res.error ?? "Erro ao atualizar serviço");
      }
    } catch (error: any) {
      toast.error("Falha ao atualizar serviço");
      console.error("Erro handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setEditMode((prev) => !prev)}>
        {editMode ? "Cancelar" : "Editar"}
      </Button>

      {editMode ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border p-4 shadow-sm"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              name="host"
              value={form.host}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="host">User</Label>
            <Input
              id="user"
              name="user"
              value={form.user}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              value={form.port}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Chave SSH</Label>
            <Select value={form.key_sshId} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma chave SSH" />
              </SelectTrigger>
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
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      ) : (
        <div className="space-y-2 rounded-lg border p-4 text-sm shadow-sm">
          <p>
            <strong>Nome:</strong> {service.name || "N/A"}
          </p>
          <p>
            <strong>Tipo:</strong> {service.type || "N/A"}
          </p>
          <p>
            <strong>Host:</strong> {service.host || "N/A"}
          </p>
          <p>
            <strong>User:</strong> {service.user || "N/A"}
          </p>
          <p>
            <strong>Port:</strong> {service.port || "N/A"}
          </p>
          <p>
            <strong>SSH Key:</strong> {service.Key_ssh?.name || "N/A"}
          </p>
          <p>
            <input value={service.Key_ssh?.publicKey || "N/A"} readOnly />
          </p>
          <p>
            <strong>Criado em:</strong>{" "}
            {service.createdAt
              ? new Date(service.createdAt).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>Atualizado em:</strong>{" "}
            {service.updatedAt
              ? new Date(service.updatedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
