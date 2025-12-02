"use server";

import { prisma } from "@/src/lib/prisma";

export const GetCluster = async () => {
    const clusters = await prisma.cluster.findMany({
        include: {
            metrics: true
        },
    });

    return clusters;
};
