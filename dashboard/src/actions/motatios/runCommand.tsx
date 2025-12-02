"use server"

import { prisma } from "@/src/lib/prisma"
import { Client } from "ssh2"

interface RunCommandProps {
  id: string
  command: string
}

export async function runCommand({ id, command }: RunCommandProps) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: { Key_ssh: true },
  })

  if (!service) {
    return { error: "Serviço não encontrado", status: 404 }
  }

  if (!service.host || !service.port || !service.Key_ssh?.privateKey || !service.user) {
    return { error: "Configuração de conexão SSH incompleta", status: 400 }
  }

  return new Promise((resolve) => {
    const conn = new Client()

    conn
      .on("ready", () => {
        conn.exec(command || "ls", (err, stream) => {
          if (err) {
            conn.end()
            return resolve({ output: "", code: 1, error: err.message })
          }

          let output = ""

          stream
            .on("close", (code: number) => {
              conn.end()
              resolve({ output, code })
            })
            .on("data", (data: Buffer) => {
              output += data.toString()
            })
            .stderr.on("data", (data: Buffer) => {
              output += data.toString()
            })
        })
      })
      .on("error", (err) => {
        resolve({ output: "", code: 1, error: err.message })
      })
      .connect({
        host: service.host || "127.0.0.1",
        port: service.port || 22,
        username: service.user || "root",
        privateKey: service.Key_ssh?.privateKey,
      })
  })
}
