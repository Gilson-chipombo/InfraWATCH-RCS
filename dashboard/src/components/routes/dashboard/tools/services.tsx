'use client'

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GetServices } from "@/src/actions/querys/getServices";
import { ServicesProps } from "@/src/types/interfaces";
import { Card } from "@/src/components/ui/card";
import { useTheme } from "next-themes";
import { cn } from "@/src/lib/utils";

export default function Services() {
    const router = useRouter();
    const { theme } = useTheme();

    const { isLoading, error, data: services } = useQuery<ServicesProps[]>({
        queryKey: ["GetServices"],
        queryFn: GetServices,
    });

    return (
        <Card className="flex flex-col gap-2 p-3 shadow-none">
            {isLoading ? (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-12 rounded-md bg-muted animate-pulse" />
                ))
            ) : error instanceof Error ? (
                <p className="w-full bg-red-900 text-white rounded-md p-4">{error.message}</p>
            ) : (
                services?.map((item) => (
                    <Card
                        key={item.id}
                        className={cn(
                            "relative p-2 gap-0 rounded-lg shadow-none cursor-pointer",
                            theme == "dark" ? "bg-background" : "bg-muted"
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
        </Card>

    );
}
