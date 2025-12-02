"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Globe, Activity, Camera } from "lucide-react"

interface Service {
  id: string
  host?: string
  name?: string
}

interface SiteProfile {
  screenshot?: string
  title?: string
  description?: string
}

export default function SiteOverview({ service }: { service: Service }) {
  const {
    data: status,
    error: errorStatus,
    isLoading: loadingStatus,
  } = useQuery({
    queryKey: ["site-status", service.id],
    queryFn: async () => {
      const res = await axios.get(service.host || "")
      return {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        responseTime: Date.now(),
      }
    },
    enabled: !!service?.host,
    retry: 1,
  })

  const {
    data: profile,
    error: errorProfile,
    isLoading: loadingProfile,
  } = useQuery({
    queryKey: ["site-profile", service.id],
    queryFn: async (): Promise<SiteProfile> => {
      // Mock implementation - replace with actual getSiteProfile function
      return {
        screenshot: "/generic-website-screenshot.png",
        title: "Site Preview",
        description: "Website screenshot and metadata",
      }
    },
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
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Site Overview</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* HTTP Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              HTTP Status
            </CardTitle>
            {status && (
              <Badge variant={getStatusColor(status.status)}>
                {status.status} {status.statusText}
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
                <p className="text-xs mt-1">{(errorStatus as Error).message}</p>
              </div>
            ) : status ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">URL:</span>{" "}
                  <span className="text-muted-foreground">{service.host}</span>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(
                      {
                        status: status.status,
                        statusText: status.statusText,
                        contentType: status.headers?.["content-type"],
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Site Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Site Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProfile ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
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
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                {profile.title && (
                  <div className="text-sm">
                    <span className="font-medium">Title:</span>{" "}
                    <span className="text-muted-foreground">{profile.title}</span>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
