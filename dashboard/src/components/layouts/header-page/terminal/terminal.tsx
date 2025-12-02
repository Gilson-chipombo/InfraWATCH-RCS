'use client';

import { useIsMobile } from '@/src/hooks/use-mobile';
import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { ErrorState } from '../../ErrorState';

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const isMobile = useIsMobile();
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
      fontFamily: 'monospace',
      fontSize: 14,
      convertEol: true,
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    term.current.open(terminalRef.current);
    fitAddon.current.fit(); // ajusta ao container

    const wsUrl = process.env.NEXT_PUBLIC_WEBTERM_URL_WS as string;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      const blue = '\x1b[36m';
      const reset = '\x1b[0m';
      const yellow = '\x1b[33m';

      if (!isMobile) {
        term.current?.writeln(`
  ${blue}888        d8b           Yb        dP       w        8     
   8  8d8b.  8'  8d8b .d88  Yb  db  dP  .d88 w8ww .d8b 8d8b. 
   8  8P Y8 w8ww 8P   8  8   YbdPYbdP   8  8  8   8    8P Y8 
  888 8   8  8   8    \`Y88    YP  YP    \`Y88  Y8P \`Y8P 8   8${reset}
  
  ${yellow}🚀 Bem-vindo ao XTerminal! Conectado ao servidor...${reset}
  `);
      }
    };

    socket.onerror = () => setConnectionError(true);
    socket.onclose = () => setConnectionError(true);

    socket.onmessage = (event) => {
      term.current?.write(event.data);
    };

    term.current.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });

    // 🔥 redimensionar quando a janela mudar de tamanho
    const handleResize = () => fitAddon.current?.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.close();
      term.current?.dispose();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-70px)] bg-black border-t-2 p-4">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}
