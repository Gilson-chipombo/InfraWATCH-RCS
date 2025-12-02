"use client"

import { editService } from "@/src/actions/motatios/createService";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { queryClient } from "@/src/providers/QueryClientProvider";
import { Service } from "@/src/types/interfaces";
import { useState } from "react";
import { toast } from "sonner";

export function EditService({ service }: { service: Service }) {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: service.name,
        host: service.host ?? "",
        password: service.password ?? "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await editService(service.id, form);

            if (res.success) {
                toast.success("Serviço reconfigurado com sucesso!");
                // Invalida cache para refetch automático
                queryClient.invalidateQueries({ queryKey: ["service", service.id] });
                setEditMode(false);
            } else {
                toast.error(res.error ?? "Erro ao atualizar serviço");
            }
        } catch (error: any) {
            toast.error("Falha ao atualizar serviço");
            console.error("Erro handleSubmit:", error);
        }
    };


    return (
        <div className="space-y-4">
            <div>
                <Button onClick={() => setEditMode((prev) => !prev)}>
                    {editMode ? "Cancelar" : "Editar"}
                </Button>
            </div>

            {editMode ? (
                // Formulário de edição
                <form onSubmit={handleSubmit} className="space-y-2">
                    <p>
                        <strong>Nome:</strong>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1"
                        />
                    </p>
                    <p>
                        <strong>Host:</strong>
                        <Input
                            name="host"
                            value={form.host}
                            onChange={handleChange}
                            className="mt-1"
                        />
                    </p>
                    <p>
                        <strong>Password:</strong>
                        <Input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className="mt-1"
                        />
                    </p>

                    <Button type="submit" className="mt-2">
                        Salvar
                    </Button>
                </form>
            ) : (
                // Visualização somente leitura
                <div className="space-y-1 text-sm">
                    <p>
                        <strong>Nome:</strong> {service.name}
                    </p>
                    <p>
                        <strong>Tipo:</strong> {service.type}
                    </p>
                    <p>
                        <strong>Host:</strong> {service?.host}
                    </p>
                    <p>
                        <strong>Password:</strong> {service?.password}
                    </p>
                    <p>
                        <strong>Criado em:</strong>{" "}
                        {new Date(service.createdAt).toLocaleString()}
                    </p>
                    <p>
                        <strong>Atualizado em:</strong>{" "}
                        {new Date(service.updatedAt).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
}
