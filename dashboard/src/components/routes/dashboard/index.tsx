'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import ChatBot from "./tabs/chat";
import { useEffect, useState } from "react";
import Image from "next/image";
import Events from "./tabs/events";
import Overview from "./tabs/overview";
import { cn } from "@/src/lib/utils";
import Cluster from "./tabs/cluster";
import SlaComponent from "./tabs/sla";
import Settings from "./tabs/settings";
import { useLanguage } from "@/src/providers/LanguageProvider";

interface InfraPageProps {
    className?: string;
    data: any;
}

export default function DashboardPage({ className, data }: InfraPageProps) {
    const [showLogo, setShowLogo] = useState(false);
    const { language } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setShowLogo(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Tabs defaultValue="overview" className={cn("w-full space-y-0 gap-0", className)}>
            <div className="sticky top-0 z-10 flex justify-between bg-card border-b px-4 sm:px-8 max-w-full h-[49px] overflow-y-hidden overflow-x-auto no-scrollbar">
                <TabsList className="flex bg-card p-0 border-b-0 py-6 items-center gap-3">
                    <div
                        className={cn(
                            "transition-all duration-300 ease-in-out",
                            showLogo
                                ? "block"
                                : "hidden"
                        )}
                    >
                        <Image
                            src="/logo.png"
                            width={30}
                            height={30}
                            alt="logo"
                            className="brightness-1 contrast-75 dark:brightness-[10]"
                        />
                    </div>

                    <TabsTrigger value="overview" className="tabStyle">
                        {language.Dashboard.tab.overview}
                    </TabsTrigger>
                    <TabsTrigger value="events" className="tabStyle">
                        {language.Dashboard.tab.events}
                    </TabsTrigger>
                    <TabsTrigger value="clasters" className="tabStyle">
                        {language.Dashboard.tab.clusters}
                    </TabsTrigger>
                    <TabsTrigger value="sla" className="tabStyle">
                        {language.Dashboard.tab.reports}
                    </TabsTrigger>
                    {/* <TabsTrigger value="ia" className="tabStyle">
                        <span>Welwitsh</span>
                        <b className="-ml-1.5">IA</b>
                    </TabsTrigger> */}
                    <TabsTrigger value="settings" className="tabStyle">
                        {language.Dashboard.tab.settings}
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview">
                <Overview />
            </TabsContent>
            <TabsContent value="events" className="h-full gap-0">
                <Events />
            </TabsContent>
            <TabsContent value="clasters" className="h-full gap-0">
                <Cluster />
            </TabsContent>
            <TabsContent value="sla" className="h-full gap-0">
                <SlaComponent />
            </TabsContent>
            <TabsContent value="ia">
                <ChatBot />
            </TabsContent>
            <TabsContent value="settings">
                <Settings />
            </TabsContent>
        </Tabs>
    );
}
