"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidateTag } from "next/cache";
import { Client } from "pg"; // lib pg
import { sendGrpcCommand } from "../grpc/client";

export async function createService(data: any) {
  try {
    // Verifica se já existe serviço com mesmo nome
    const exists = await prisma.service.findFirst({
      where: { name: data.name ?? data.type },
    });

    if (exists) {
      return {
        success: false,
        error: "Já existe um serviço com este nome.",
      };
    }

    // Se tiver dbUrl e for postgres, testa conexão
    if (data.type === "database" && data.dbUrl && data.dbType === "postgres") {
      const client = new Client({ connectionString: data.dbUrl });
      try {
        await client.connect();
        await client.end();
      } catch (err) {
        return {
          success: false,
          error: "Não foi possível conectar ao PostgreSQL com a URL fornecida.",
        };
      }
    }

    else if (data.type === "web-services" && (data.wsUrl && (data.wsType === "web" || data.wsType === "api"))) {
      try {
        // Remove o protocolo caso exista (http:// ou https://)
        const cleanUrl = data.wsUrl.replace(/^https?:\/\//, "");

        // Se a URL original começar com https, mantém https, senão usa http
        const protocol = data.wsUrl.startsWith("https") ? "https" : "http";

        const res = await fetch(`${protocol}://${cleanUrl}`);

        if (!res.ok) {
          return {
            success: false,
            status: res.status,
            error: "Não foi possível conectar à URL fornecida.",
          };
        }


      } catch (err: any) {
        return {
          success: false,
          status: err?.status ?? 500,
          error: "Erro ao tentar conectar com a URL fornecida.",
        };
      }
    }

    else if (data.type === "servers" && (data.host && data.port && data.password)) {
      console.log(data)
      try {
        // Chamada gRPC
        const res = await sendGrpcCommand(data.host, data.port, data.password, "system") as any;

        // Verifica se a resposta contém erro
        if (res?.err) {
          return {
            success: false,
            details: res.details || null,
            error: res.message || "Erro desconhecido do gRPC.",
          };
        }

      } catch (err: any) {
        // Captura erros inesperados
        return {
          success: false,
          status: err?.status ?? 500,
          error: err?.message || "Erro ao tentar conectar com a URL fornecida.",
        };
      }
    } 


    // Cria serviço
    const service = await prisma.service.create({
      data: {
        type: data.type,
        name: data.name ?? data.type,
        dbType: data.dbType,
        dbUrl: data.dbUrl,
        wsType: data.wsType,
        wsUrl: data.wsUrl,
        host: data.host,
        user: data.user,
        port: data.port ? Number(data.port) : null,
        password: data.password,
        containerName: data.containerName,
        image: data.image,
        key_sshId: data.key_sshId ? data.key_sshId : null
      },
    });

    return service;
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Erro inesperado ao criar serviço.",
    };
  }
}

export async function editService(id: string, data: any) {
  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado.",
      };
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        type: data.type ?? service.type,
        name: data.name ?? service.name,
        dbType: data.dbType ?? service.dbType,
        dbUrl: data.dbUrl ?? service.dbUrl,
        wsType: data.wsType ?? service.wsType,
        wsUrl: data.wsUrl ?? service.wsUrl,
        host: data.host ?? service.host,
        key_sshId: data.key_sshId ?? service.key_sshId,
        user: data.user ?? service.user,
        port: data.port ? Number(data.port) : service.port,
        password: data.password ?? service.password,
        containerName: data.containerName ?? service.containerName,
        image: data.image ?? service.image,
        updatedAt: new Date()
      },
    });

    return {success: true, updated};
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Erro inesperado ao editar serviço.",
    };
  }
}

export async function deleteService(id: string) {
  try {
    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado.",
      };
    }

    const deleted = await prisma.service.delete({ where: { id } });

    revalidateTag("listServices");

    return {
      success: true,
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Erro inesperado ao deletar serviço.",
    };
  }
}

