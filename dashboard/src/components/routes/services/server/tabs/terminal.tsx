'use client'
import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import io, { Socket } from 'socket.io-client';
import { Service } from '@/src/types/interfaces';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { TerminalIcon } from 'lucide-react';

export default function SSH_Web_Term({ service }: { service: Service }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState('');
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (!term.current) {
            term.current = new Terminal({
                cursorBlink: true,
                fontSize: 14,
                theme: {
                    background: '#000000', // azul bem escuro
                    foreground: '#e2e8f0', // cinza claro
                    cursor: '#38bdf8',     // azul claro
                }
            });

            fitAddon.current = new FitAddon();
            term.current.loadAddon(fitAddon.current);

            if (terminalRef.current) {
                term.current.open(terminalRef.current);
                fitAddon.current.fit();
            }
        }
        const url = process.env.NEXT_PUBLIC_SSH_URL
        const newSocket = io(url);
        setSocket(newSocket);

        newSocket.on('output', (data) => {
            term.current?.write(data);
        });

        newSocket.on('ssh-ready', () => {
            setConnected(true);
            setConnecting(false);
            setError('');
            term.current?.focus();
        });

        newSocket.on('ssh-error', (err) => {
            setError(err);
            setConnecting(false);
            setConnected(false);
        });

        newSocket.on('ssh-close', () => {
            setConnected(false);
            term.current?.writeln('\r\n🔴 Conexão SSH fechada.');
        });

        return () => {
            newSocket.close();
            term.current?.dispose();
            term.current = null;
        };
    }, []);

    useEffect(() => {
        if (term.current && connected && socket) {
            term.current.onData((data) => {
                socket.emit('input', data);
            });
        }
    }, [connected, socket]);

    const handleConnect = () => {
        if (!service.host || !service.user || !service.Key_ssh?.privateKey) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        setConnecting(true);
        setError('');

        const config = {
            host: service.host,
            port: service.port,
            username: service.user,
            privateKey: service.Key_ssh?.privateKey
        };

        socket?.emit('ssh-connect', config);
    };

    const handleDisconnect = () => {
        if (socket) {
            socket.disconnect();
            setConnected(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black">
            {!connected && (
                <div className="flex flex-1 items-center justify-center bg-red-800">
                    <div className="flex justify-center text-center flex-col absolute m-auto top-[calc(100vh/2-50px)] p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-center text-white">Acessar terminal ssh</h2>
                        <span className='text-sm text-white  my-4'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni dignissimos molestiae</span>

                        {error && (
                            <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">
                                Erro: {error}
                            </div>
                        )}

                        <Button
                            onClick={handleConnect}
                            variant={'outline'}
                            disabled={connecting}
                           
                        >
                            <TerminalIcon />
                            {connecting ? 'Conectando...' : 'Conectar ao terminal remoto'}
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex flex-col h-screen bg-black">
                {connected && (
                    <div className="shrink-0 flex justify-between items-center p-3 bg-sidebar border-b border-border sticky top-[49px] z-20">
                        <h2 className="text-lg font-semibold">Terminal SSH</h2>
                        <Button variant="destructive" onClick={handleDisconnect}>
                            Desconectar
                        </Button>
                    </div>
                )}
                <div ref={terminalRef} className={cn("flex-1 w-full overflow-hidden", !connected && "hidden")} />
            </div>

        </div>
    );
}
