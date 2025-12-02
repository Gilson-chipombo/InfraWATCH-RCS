"use server";

import { prisma } from "@/src/lib/prisma";

export const getInfoDataPostID = async (id:string) => {
    const post = await prisma.post.findUnique({where:{id}})
    console.log(post)
    return post;
}