"use client"

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Activity } from "lucide-react"

import { getSiteProfile } from "@/src/actions/querys/getSiteProfile"
import { getSiteStatus } from "@/src/actions/querys/getSiteStatus"
import type { Service, RootResponse, SiteProfile } from "@/src/types/interfaces"

export default function Overview({ service }: { service: Service }) {
    const {
        data: status,
        error: errorStatus,
        isLoading: loadingStatus,
    } = useQuery({
        queryKey: ["site-status", service.id],
        queryFn: () => getSiteStatus({ httpUrl: service.host || "" }),
        enabled: !!service?.host,
        retry: 1,
    })

    const {
        data: profile,
        error: errorProfile,
        isLoading: loadingProfile,
    } = useQuery<SiteProfile, Error>({
        queryKey: ["site-profile", service.id],
        queryFn: () => getSiteProfile({ goto: service.host || "" }),
        enabled: !!service?.host,
    })

    const getStatusColor = (status?: number) => {
        if (!status) return "secondary"
        if (status >= 200 && status < 300) return "default"
        if (status >= 300 && status < 400) return "secondary"
        if (status >= 400 && status < 500) return "destructive"
        return "destructive"
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-center border-b m-auto items-center py-6">
                <div className="max-w-[70%] w-full flex justify-between items-center">
                    <h1 className="text-5xl">{service.name}</h1>
                    <div className="flex items-center gap-3">
                        <Button variant="outline">Conectar com GitHub</Button>
                        <Button asChild>
                            <a href={service.host} target="_blank" rel="noopener noreferrer">
                                Visitar
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[70%] m-auto mt-10 grid gap-6 md:grid-cols-2">
                {/* Site Profile */}
                <Card className="p-2 m-0 h-[400px]" aria-disabled>
                    <div className="p-0 rounded-lg m-0 h-full contain-content">
                        {loadingProfile ? (
                            <div className="space-y-3">
                                <Skeleton className="h-[400px] w-full rounded-md" />
                            </div>
                        ) : errorProfile ? (
                            <div className="text-red-600 text-sm">
                                <p className="font-medium">Preview Error</p>
                                <p className="text-xs mt-1">{(errorProfile as Error).message}</p>
                            </div>
                        ) : profile ? (
                            <div className="space-y-3">
                                {profile.screenshot && (
                                    <div className="border rounded-md overflow-hidden">
                                        <img
                                            src={profile.screenshot || "/placeholder.svg"}
                                            alt="Site screenshot"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </Card>
                {/* HTTP Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            HTTP Status
                        </CardTitle>
                        {status && status.httpData?.status != null && (
                            <Badge variant={getStatusColor(status.httpData.status)}>
                                {status.httpData.status} {status.httpData.statusText}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loadingStatus ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : errorStatus ? (
                            <div className="text-red-600 text-sm">
                                <p className="font-medium">Connection Error</p>
                                <p className="text-xs mt-1">{errorStatus.message}</p>
                            </div>
                        ) : status ? (
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <span className="font-medium">URL:</span>{" "}
                                    <span className="text-muted-foreground">{service.host}</span>
                                </div>
                                <div className="space-y-2 text-xs  p-3 rounded-md  overflow-y-auto">
                                    {status && status.httpData?.headers && Object.entries(status.httpData.headers).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="font-medium">{key}:</span>
                                            <span className="text-muted-foreground break-all">
                                                {Array.isArray(value) ? value.join("; ") : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
