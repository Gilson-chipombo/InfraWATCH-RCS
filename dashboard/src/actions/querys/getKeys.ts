'use server'

import { prisma } from "@/src/lib/prisma";

export async function getKeys() {
  try {
    const keys = await prisma.key_ssh.findMany({
      orderBy: { id: "asc" }, // pode trocar por createdAt se tiver
      select: {
        id: true,
        name: true,
        publicKey: true,
        updatedAt: true
      },
    });

    return keys
  } catch (error) {
    throw new Error("Failed to retrieve SSH keys");
  }
}
