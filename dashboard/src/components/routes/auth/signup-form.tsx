'use client'

import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { cn } from "../../../lib/utils"
import { useState } from "react";
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/useAuth"
import { toast } from "sonner"

export function RegisterPage({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            return setError("As senhas não coincidem");
        }

        try {
            setLoading(true);
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            console.log(res)
            const result = res.json()

            console.log(result)
            if (!res.ok) throw new Error(await res.text());
            toast("usuario criado com sucesso")
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create a new account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Preencha os dados abaixo para criar sua conta
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome completo"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        placeholder="Seu username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="email@exemplo.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar senha"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Cadastrando..." : "Registrar"}
                </Button>
            </div>
        </form>
    )
}
