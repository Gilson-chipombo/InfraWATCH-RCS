"use server";

import { prisma } from "@/src/lib/prisma";

export const getInfoDataEmailID = async (id:string) => {
    const email = await (prisma as any).email.findUnique({where:{id}})
    console.log(email)
    return email;
}