'use client'

import { runCommand } from "@/src/actions/motatios/runCommand"
import { Service } from "@/src/types/interfaces"
import { useQuery } from "@tanstack/react-query"

export default function Overview({ service }: { service: Service }) {
  const { data: serviceServer, error, isPending } = useQuery({
    queryKey: ["serviceServer", service.id],
    queryFn: async () =>
      runCommand({ id: service.id, command: "uname -a && lscpu && free -h" }),
    enabled: !!service,
  })

  if (isPending) return <p>Carregando informações do servidor...</p>
  if (error instanceof Error) return <p>Erro: {error.message}</p>
  if (!serviceServer) return <p>Nenhum dado encontrado</p>

  return (
    <div className="space-y-6">
        <pre>{JSON.stringify(serviceServer, null, 2)}</pre>
      {/* Sistema */}
      <div>
        <h1 className="text-lg font-bold">Sistema</h1>
        <p>{serviceServer.system?.info}</p>
      </div>
      <hr />

      {/* CPU */}
      <div>
        <h1 className="text-lg font-bold">CPU</h1>
        <p><b>Modelo:</b> {serviceServer.cpu?.model || "N/A"}</p>
        <p><b>Arquitetura:</b> {serviceServer.cpu?.arch || "N/A"}</p>
        <p><b>Núcleos:</b> {serviceServer.cpu?.cores || "N/A"}</p>
      </div>
      <hr />

      {/* Memória */}
      <div>
        <h1 className="text-lg font-bold">Memória</h1>
        <p><b>Total:</b> {serviceServer.memory?.total || "N/A"}</p>
        <p><b>Usada:</b> {serviceServer.memory?.used || "N/A"}</p>
        <p><b>Livre:</b> {serviceServer.memory?.free || "N/A"}</p>
      </div>
    </div>
  )
}
