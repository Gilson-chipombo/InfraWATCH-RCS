'use client';

import { useQuery } from "@tanstack/react-query";
import { BridgeOne } from "../menuOptions/bridgeOne";
import { GetCluster } from "@/src/actions/querys/getCluster";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/src/components/ui/resizable";
import { Tabs, TabsList } from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Button } from "@/src/components/ui/button";
import dynamic from "next/dynamic";

export default function Cluster() {
    const { isLoading, error, data: clusters } = useQuery({
        queryKey: ["GetCluster"],
        queryFn: GetCluster,
    });


    const Mapa = dynamic(() => import("@/src/components/layouts/Mapa"), {
        ssr: false,
    });

    return (
        <div className="flex w-full h-[calc(100vh-70px-49px)]">
            <ResizablePanelGroup direction="horizontal" className="w-full">
                <ResizablePanel defaultSize={15} className="border-r ">
                    <div className="">
                        <header className="border-b flex justify-between items-center h-[60px] px-3">
                            <BridgeOne />
                        </header>
                        <div className="flex flex-col gap-2 p-1 px-">
                            {isLoading ? (
                                [...Array(7)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full h-12 rounded-md bg-muted animate-pulse"
                                    />
                                ))
                            ) : error instanceof Error ? (
                                <p className="w-full bg-red-900 text-white rounded-md p-4">
                                    {error.message}
                                </p>
                            ) : (

                                clusters && clusters.map((cluster) => (
                                    <div key={cluster.id} className="border p-2 rounded">
                                        <h2>{cluster.name}</h2>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={85}>
                    <Tabs defaultValue="http">
                        <TabsList className="px-4 border-b h-[60px] flex justify-between items-center bg-background rounded-none w-full">
                            <div className="flex w-full items-center gap-3">
                                <div className="flex flex-row items-center w-full justify-center ml-2">
                                    <Input placeholder="Pesquisar por eventos" />
                                </div>
                                <div className="flex gap-2">
                                    <TabsTrigger value="http" className="px-4">
                                        HTTP
                                    </TabsTrigger>
                                    <TabsTrigger value="ping" className="px-4">
                                        ICMP
                                    </TabsTrigger>
                                </div>
                            </div>
                        </TabsList>
                        <TabsContent value="http">
                            <Mapa className="z-5 h-[calc(100vh-70px-48px-60px)]" />
                        </TabsContent>
                        <TabsContent value="ping">
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}