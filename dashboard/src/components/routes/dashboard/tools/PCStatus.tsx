"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../ui/card";
import { getCIDRs } from "@/src/actions/querys/getCPUinfo";
import { ChartBarInteractive } from "@/src/components/templates/charts/interactivee/chart-bar-interactivee";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Services from "./services";
import Clusters from "./clusters";
import dynamic from "next/dynamic";

interface PCData {
    cpu: {
        usagePercent: string;
        cores: number;
        model: string;
    };
    memory: {
        usagePercent: string;
        total: string;
        free: string;
        used: string;
    };
    system: {
        hostname: string;
        platform: string;
        type: string;
        version: string;
        uptime: string;
        ip: string;
    };
}

const Mapa = dynamic(() => import("@/src/components/layouts/Mapa"), {
    ssr: false,
});

export default function PCStatus() {
    const [data, setData] = useState<PCData | null>(null);
    const { language: t } = useLanguage();

    const teste = async () => {
        const data = await getCIDRs();
        console.log(data)
    }

    useEffect(() => {
        // Carregar do localStorage ao iniciar

        teste()

        const savedData = localStorage.getItem("pc-status");
        if (savedData) {
            setData(JSON.parse(savedData));
        }

        const eventSource = new EventSource("/api/pc-info");

        eventSource.onmessage = (event) => {
            const parsedData: PCData = JSON.parse(event.data);
            setData(parsedData);
            localStorage.setItem("pc-status", JSON.stringify(parsedData)); // Salva no localStorage
        };

        return () => {
            eventSource.close();
        };
    }, []);

    if (!data) {
        return (
            <div className="p-6 text-center text-gray-500">
                Aguardando dados do sistema...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 ">
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] gap-3">
                {/* Cartão principal */}
                <Card className="flex flex-col justify-center items-center p-4 shadow-none">
                    <h1 className="text-5xl font-bold">{data.system.type}</h1>
                    <h2 className="text-xl mt-2">{data.system.hostname}</h2>
                    <div className="mt-6 text-center">
                        <p className="text-lg">{t.PCStatus.ip_address}</p>
                        <p className="text-xl font-mono">{data.system.ip}</p>
                    </div>
                </Card>
                <div className="grid grid-cols-2 gap-2 h-[400px]">
                    <Services />
                    <Clusters />
                </div>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] gap-3">
                {/* Status do sistema */}
                <Card className="p-10 bg-background shadow-none">
                    <h2 className="text-2xl font-bold mb-4">{t.PCStatus.system_status}</h2>

                    {/* CPU */}
                    <div className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span>CPU ({data.cpu.cores} {t.PCStatus.cores})</span>
                            <span>{data.cpu.usagePercent}</span>
                        </div>
                        <div className="w-full rounded-full h-2.5 bg-border">
                            <div
                                className="bg-blue-400 h-2.5 rounded-full"
                                style={{ width: data.cpu.usagePercent }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1">{data.cpu.model}</p>
                    </div>

                    {/* Memória */}
                    <div className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span>{t.PCStatus.memory}</span>
                            <span>{data.memory.usagePercent}</span>
                        </div>
                        <div className="w-full rounded-full h-2.5 bg-border">
                            <div
                                className="bg-green-400 h-2.5 rounded-full"
                                style={{ width: data.memory.usagePercent }}
                            ></div>
                        </div>
                        <div className="text-sm mt-1">
                            {data.memory.free} {t.PCStatus.free_of} {data.memory.total}
                        </div>
                    </div>

                    {/* Sistema */}
                    <div className="mt-2">
                        <span>{t.PCStatus.os}: {data.system.platform}</span>
                        <div>{t.PCStatus.uptime}: {data.system.uptime}</div>
                    </div>
                </Card>


                {/* Informações detalhadas */}
                <Card className="p-0 shadow-none contain-content">
                    <Mapa className="h-full" />
                </Card>
            </div>
            <Card className="p-6 shadow-none">
                <h2 className="text-2xl font-bold mb-4">{t.PCStatus.detailed_info}</h2>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <h3 className="font-bold mb-2">{t.PCStatus.processor}</h3>
                        <p>{t.PCStatus.cores}: {data.cpu.cores}</p>
                        <p>{t.PCStatus.model}: {data.cpu.model}</p>
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-bold mb-2">{t.PCStatus.memory}</h3>
                        <p>Total: {data.memory.total}</p>
                        <p>Livre: {data.memory.free}</p>
                        <p>Em uso: {data.memory.used}</p>
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-bold mb-2">Sistema</h3>
                        <p>Plataforma: {data.system.platform}</p>
                        <p>Tipo: {data.system.type}</p>
                        <p>{t.PCStatus.version}: {data.system.version}</p>
                    </Card>
                </div>
            </Card>
        </div>
    );
}
