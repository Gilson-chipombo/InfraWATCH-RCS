import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto"; // para gerar um uid se necessário
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name"); const uid = randomUUID(); // Exemplo: cria um uid aleatório
    const folderPath = path.resolve(`./ssh/${uid}`);
    const privateKeyPath = path.join(folderPath, "id_rsa");
    const publicKeyPath = path.join(folderPath, "id_rsa.pub");

    // Cria a pasta antes de tentar gerar as chaves
    await fs.mkdir(folderPath, { recursive: true });

    // Cria pasta e gera chave com ssh-keygen
    await new Promise<void>((resolve, reject) => {
      // quote the path so spaces/backslashes on Windows are handled correctly
      exec(
        `ssh-keygen -t rsa -b 2048 -f "${privateKeyPath}" -q -N ""`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Lê os arquivos das chaves
    const privateKey = await fs.readFile(privateKeyPath, "utf-8");
    const publicKey = await fs.readFile(publicKeyPath, "utf-8");

    const data = await prisma.$executeRawUnsafe(`
      INSERT INTO "Key_ssh" (id, name, "privateKey", "publicKey", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
    `, name, privateKey, publicKey);

    // Retorna as chaves no JSON
    return NextResponse.json({
      success: true,
      ...data,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
