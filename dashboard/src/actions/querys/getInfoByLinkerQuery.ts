export const getInfoByLinkerQuery = (
    id: string,
    timeoutMs = 10000
): { promise: Promise<{ info?: string; data?: string }>; close: () => void } => {
    const socket = new WebSocket("ws://localhost:3000");
    let closed = false;
    let timer = 0;
    let resolveFn: (v: { info?: string; data?: string }) => void = () => {};
    let rejectFn: (e: any) => void = () => {};

    const cleanup = () => {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        socket.removeEventListener("message", onMessage);
        socket.removeEventListener("open", onOpen);
        socket.removeEventListener("error", onError);
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close();
        }
    };

    const onOpen = () => {
        socket.send(
            JSON.stringify({
                type: "register",
                token: id,
            })
        );
    };

    const onMessage = (event: MessageEvent) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.event === `info/${id}`) {
                cleanup();
                resolveFn({ info: msg.data?.message });
            } else if (msg.event === `response/${id}`) {
                cleanup();
                resolveFn({ data: msg.data?.stdout || "sem resposta" });
            }
        } catch (err) {
            console.error("Erro ao processar mensagem:", err);
        }
    };

    const onError = (err: Event) => {
        cleanup();
        rejectFn(new Error("WebSocket error"));
        console.error("Erro WebSocket:", err);
    };

    const promise = new Promise<{ info?: string; data?: string }>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;

        socket.addEventListener("open", onOpen);
        socket.addEventListener("message", onMessage);
        socket.addEventListener("error", onError);

        timer = window.setTimeout(() => {
            cleanup();
            reject(new Error("Timeout waiting for response"));
        }, timeoutMs);
    });

    return { promise, close: cleanup };
};