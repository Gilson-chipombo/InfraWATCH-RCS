'use client'

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { BridgeOne } from "../menuOptions/bridgeOne";
import { GetCluster } from "@/src/actions/querys/getCluster";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Computer } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/src/components/ui/sheet"

export default function Clusters() {
    const router = useRouter();
    const { theme } = useTheme();

    const { isLoading, error, data: clusters } = useQuery({
        queryKey: ["GetCluster"],
        queryFn: GetCluster,
    });

    return (
        <Card className="p-3 shadow-none">
            <div className="flex flex-col gap-2 p-0 ">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-12 rounded-md bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                ) : error instanceof Error ? (
                    <p className="w-full bg-red-900 text-white rounded-md p-4">
                        {error.message}
                    </p>
                ) : (

                    <div className="grid grid-cols-3 gap-3">
                        {clusters && clusters.map((cluster) => (
                            <>
                                <Sheet>
                                    <SheetTrigger>
                                        <Button variant={"outline"} key={cluster.id} className="w-full">
                                            <Computer />
                                            <h2 className="border-l pl-2">{cluster.name}</h2>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Are you absolutely sure?</SheetTitle>
                                            <SheetDescription>
                                                This action cannot be undone. This will permanently delete your account
                                                and remove your data from our servers.
                                            </SheetDescription>
                                        </SheetHeader>
                                    </SheetContent>
                                </Sheet >
                            </>
                        )
                        )}
                    </div>
                )}
            </div>
        </Card >
    );
}
