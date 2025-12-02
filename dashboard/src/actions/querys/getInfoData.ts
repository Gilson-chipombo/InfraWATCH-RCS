"use server";

import { prisma } from "@/src/lib/prisma";

export const GetInfoData = async () => {
    const posts = await prisma.post.findMany()
    const enrolls = await prisma.enroll.findMany()
    return {posts,enrolls};
}