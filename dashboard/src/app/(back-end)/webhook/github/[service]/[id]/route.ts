import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    context: { params: Promise<{ service: string; id: string }> }
) {
    const { service, id } = await context.params;

    try {
        const body = await req.json();
        console.log("Webhook recebido:", { service, id, body });

        const saved = await prisma.githubWebhook.create({
            data: {
                service,
                serviceId: id,
                repository: body.repository?.name ?? "unknown",
                repoUrl: body.repository?.html_url ?? "",
                branch: body.ref ?? "",
                commitId: body.head_commit?.id ?? "",
                commitMsg: body.head_commit?.message ?? "",
                commitUrl: body.head_commit?.url ?? "",
                pusherName: body.pusher?.name ?? "",
                pusherUser: body.pusher?.email ?? "",
                pusherAvatar: body.sender?.avatar_url ?? ""
            }
        });

        return NextResponse.json({ success: true, data: saved });
    } catch (error) {
        console.error("Erro no webhook:", error);
        return NextResponse.json(
            { success: false, error: "Erro ao processar payload" },
            { status: 400 }
        );
    }
}