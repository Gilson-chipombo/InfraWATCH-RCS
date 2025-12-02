'use client'

import { getGithubEvents } from "@/src/actions/querys/getGithubEvents";
import { Service } from "@/src/types/interfaces";
import { useQuery } from "@tanstack/react-query";


export default function Github({ service, id }: { service: Service, id: any }) {
    const {
        isLoading: isLoadingGithub,
        error: errorGithub,
        data: github,
    } = useQuery<any>({
        queryKey: ["github", id],
        queryFn: () => getGithubEvents({ id, service: service?.type }),
        enabled: !!id && !!service,
    });

    return (
        <div>
            {isLoadingGithub ? (
                <p>Carregando eventos do GitHub...</p>
            ) : errorGithub instanceof Error ? (
                <p>Erro: {errorGithub.message}</p>
            ) : (
                <ul className="space-y-2">
                    {github?.map((event: any) => (
                        <li key={event.id} className="border p-2 rounded">
                            <a href={event.commitUrl} target="_blank" className="text-blue-500 underline">
                                {event.commitMsg}
                            </a>{" "}
                            — <span className="font-mono">{event.branch}</span> por{" "}
                            <span>{event.pusherUser}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
