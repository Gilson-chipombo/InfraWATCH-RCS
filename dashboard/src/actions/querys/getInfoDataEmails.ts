"use server";

import { prisma } from "@/src/lib/prisma";

export const GetInfoDataEmail = async () => {
    const emails = await (prisma as any).email.findMany()
    return emails
}