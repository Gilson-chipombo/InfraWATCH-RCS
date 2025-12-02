'use server'

import { prisma } from "@/src/lib/prisma";

export async function saveWebhook(data: any) {
  return prisma.githubWebhook.create({
    data: {
      service: data.service,
      serviceId: data.id,

      repository: data.repository.name,
      repoUrl: data.repository.url,
      branch: data.repository.branch,

      commitId: data.commit.id,
      commitMsg: data.commit.message,
      commitUrl: data.commit.url,

      pusherName: data.pusher.name,
      pusherUser: data.pusher.username,
      pusherAvatar: data.pusher.avatar,
    },
  });
}
