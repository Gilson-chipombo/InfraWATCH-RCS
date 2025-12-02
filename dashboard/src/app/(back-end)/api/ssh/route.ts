import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "ssh2";

export async function POST(req: NextRequest) {
  const { id, command } = await req.json();

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      Key_ssh: true,
    }
  });

  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  if (!service.host || !service.port || !service.Key_ssh) {
    return NextResponse.json({ error: "Configuração de conexão SSH incompleta" }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve, reject) => {
    const conn = new Client();

    conn.on("ready", () => {
      conn.exec(command || "ls", (err, stream) => {
        if (err) {
          conn.end();
          return reject(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
        }

        let output = "";
        stream
          .on("close", (code: number) => {
            conn.end();
            resolve(NextResponse.json({ output, code }));
          })
          .on("data", (data: Buffer) => {
            output += data.toString();
          })
          .stderr.on("data", (data: Buffer) => {
            output += data.toString();
          });
      });
    }).connect({
      host: service.host,
      port: service.port || 22,
      username: service.user, // precisa existir no schema
      privateKey: service.Key_ssh.privateKey,
    });

    conn.on("error", (err) => {
      reject(
        NextResponse.json({ error: err.message }, { status: 500 })
      );
    });
  });
}
