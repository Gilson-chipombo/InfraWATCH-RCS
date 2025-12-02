'use client'

import { runCommand } from "@/src/actions/motatios/runCommand"
import { Service } from "@/src/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import Loading from "@/src/components/layouts/Loading"

export default function Docker({ service }: { service: Service }) {
  const { data: serviceServer, error, isPending } = useQuery({
    queryKey: ["serviceServer", "docker", service.id],
    queryFn: async () =>
      runCommand({ id: service.id, command: "docker images" }),
    enabled: !!service,
  })

  if (isPending) return <Loading />
  if (error instanceof Error) return <p>Erro: {error.message}</p>
  if (!serviceServer?.output) return <p>Nenhum dado encontrado</p>

  // Quebra o output em linhas
  const lines = serviceServer.output.trim().split("\n")
  const headers = lines[0].split(/\s{2,}/).map(h => h.trim())
  const rows = lines.slice(1).map(line =>
    line.split(/\s{2,}/).map(col => col.trim())
  )

  return (
    <div className="space-y-6">
      <Table>
        <TableCaption>Lista de imagens Docker</TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map((h, i) => (
              <TableHead key={i}>{h}</TableHead>
            ))}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
