"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import { Switch } from "@/src/components/ui/switch"

import { useEffect, useState } from "react"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { providersWebHook } from "../tools/providers"
import { Link } from "lucide-react"
import Image from "next/image"

interface Service {
    id: string
    type: string
}

export default function Webhook({ service = { id: "default", type: "webhook" } }: { service?: Service }) {
    const [baseUrl, setBaseUrl] = useState<string>("")
    const [enabledProviders, setEnabledProviders] = useState<Record<string, boolean>>({
        github: true,
        slack: true,
        stripe: true,
    })

    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])


    const toggleProvider = (providerId: string) => {
        setEnabledProviders((prev) => ({
            ...prev,
            [providerId]: !prev[providerId],
        }))
    }

    const provides = providersWebHook({
        service: service as any,
        baseUrl: baseUrl
    })

    const groupedProviders = provides.reduce(
        (acc, provider) => {
            if (!acc[provider.category]) {
                acc[provider.category] = []
            }
            acc[provider.category].push(provider)
            return acc
        },
        {} as Record<string, typeof provides>,
    )


    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Integration Providers</h1>
                    <p className="text-muted-foreground">Configure webhook integrations for your services</p>
                </div>

                <div className="space-y-8">
                    {Object.entries(groupedProviders).map(([category, categoryProviders]) => (
                        <div key={category}>
                            <h2 className="text-xl font-semibold mb-4 text-primary">{category}</h2>
                            <Card className="divide-y divide-border">
                                {categoryProviders.map((provider) => {
                                    return (
                                        <div key={provider.id} className="hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-lg bg-muted", provider.color)}>
                                                        <Image src={provider.logo} width={50} height={50} alt={provider.label} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-foreground">{provider.label}</h3>
                                                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        {enabledProviders[provider.id] ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                                                            >
                                                                Enabled
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                                            >
                                                                Disabled
                                                            </Badge>
                                                        )}
                                                        <Switch
                                                            checked={enabledProviders[provider.id] || false}
                                                            onCheckedChange={() => toggleProvider(provider.id)}
                                                        />
                                                    </div>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                                                                <Link className="w-4 h-4" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-2xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-3">
                                                                    <Image src={provider.logo} width={50} height={50} alt={provider.label} />
                                                                    {provider.label} Webhook Configuration
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Use this webhook URL to receive {provider.description.toLowerCase()} from{" "}
                                                                    {provider.label}.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="mt-6 space-y-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-foreground">Webhook URL</label>
                                                                    <div className="mt-2 p-4 bg-muted rounded-lg border">
                                                                        <code className="text-sm text-primary break-all font-mono">{provider.host}</code>
                                                                    </div>
                                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                                        Copy this URL and paste it in your {provider.label} webhook configuration.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Close</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => navigator.clipboard.writeText(provider.host)}>
                                                                    Copy URL
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
