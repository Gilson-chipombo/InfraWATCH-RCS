"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useParams, useSearchParams } from "next/navigation";
import Loading from "@/src/components/layouts/Loading";
import HeaderPage from "@/src/components/layouts/header-page/header-page";
import Computer from "@/src/components/routes/services/computers";
import Server from "@/src/components/routes/services/server";
import Database from "@/src/components/routes/services/database";
import WebService from "@/src/components/routes/services/web-services";


export default function Dashboard() {
    const params = useParams();
    const url = useSearchParams();

    const service = params.service as string;
    const id = params.id as string;
    const serviceName = url.get("service");
    const dbType = url.get("dbType");

    const { status } = useAuth();

    if (status === "unauthenticated") {
        return <span>Você precisa estar logado.</span>;
    }

    if (status === "loading") {
        return <Loading />;
    }

    const services = [
        { value: "database", component: <Database id={id} dbType={dbType} /> },
        { value: "web-services", component: <WebService id={id} /> },
        { value: "computers", component: <Computer id={id} /> },
        { value: "servers", component: <Server id={id} /> },
    ];

    const selectedService = services.find((s) => s.value === service);


    return (
        <main className="h-screen">
            <HeaderPage
                popoverDefault={{
                    label: serviceName ?? "Serviços",
                    value: service, 
                    id,            
                    dbType, 
                }}
                menuNav={[
                    { label: "Home", href: "/" },
                    { label: service || "" },
                    { label: serviceName || "" }
                ]}
            />

            <div>
                {selectedService ? (
                    selectedService.component
                ) : (
                    <p className="text-gray-500">Serviço não encontrado.</p>
                )}
            </div>
        </main>
    );
}
