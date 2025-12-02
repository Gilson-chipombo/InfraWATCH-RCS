'use client'

import { runCommand } from "@/src/actions/motatios/runCommand"
import { Service } from "@/src/types/interfaces"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"
import { useState } from "react"
import Loading from "@/src/components/layouts/Loading"

export default function DockerProcess({ service }: { service: Service }) {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [logs, setLogs] = useState<string>("")

  // Lista de containers
  const { data: serviceServer, error, isPending, refetch } = useQuery({
    queryKey: ["serviceServer", "docker-ps", service.id],
    queryFn: async () =>
      runCommand({
        id: service.id,
        command: "docker ps --format \"table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Names}}\"",
      }),
    enabled: !!service,
  }) 

  // Mutation para buscar logs
  const logsMutation = useMutation({
    mutationFn: async (containerId: string) => {
      const res = await runCommand({
        id: service.id,
        command: `docker logs ${containerId}`,
      }) as any
      return res.output
    },
    onSuccess: (data) => setLogs(data),
  })

  if (isPending) return <Loading />
  if (error instanceof Error) return <p>Erro: {error.message}</p>
  if (!serviceServer?.output) return <p>Nenhum container encontrado</p>

  // Parse do output
  const lines = serviceServer.output.trim().split("\n")
  const headers = lines[0].split(/\s{2,}/).map(h => h.trim())
  const rows = lines.slice(1).map(line =>
    line.split(/\s{2,}/).map(col => col.trim())
  )

  return (
    <div className="space-y-6">
      <Table>
        <TableCaption>Containers em execução</TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map((h, i) => (
              <TableHead key={i}>{h}</TableHead>
            ))}
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cols, i) => (
            <TableRow key={i}>
              {cols.map((col, j) => (
                <TableCell key={j} className="whitespace-nowrap">
                  {col}
                </TableCell>
              ))}
              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        const containerId = cols[0]
                        setSelectedContainer(containerId)
                        logsMutation.mutate(containerId)
                      }}
                    >
                      Logs
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Logs do container {selectedContainer}</SheetTitle>
                      <SheetDescription>
                        Últimas 50 linhas do log
                      </SheetDescription>
                    </SheetHeader>
                    <pre className="mt-4 text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {logsMutation.isPending
                        ? "Carregando logs..."
                        : logs || "Nenhum log encontrado"}
                    </pre>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
