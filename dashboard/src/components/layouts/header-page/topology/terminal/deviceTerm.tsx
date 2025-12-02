'use client'

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface DeviceXtermProps {
  host: string,
  port: string
}

export default function DeviceXterm({ host, port }: DeviceXtermProps) {
  const terminalRef = useRef(null);
  const termRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new Terminal();
      term.open(terminalRef.current);
      termRef.current = term;

      const socket = new WebSocket(`ws://${host}:${port}`);
      socketRef.current = socket;

      term.onData((data) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      });

      socket.onmessage = (event) => {
        term.write(event.data);
      };

      socket.onerror = (err) => {
        term.writeln('\r\n\x1b[31m[Erro de conexão WebSocket]\x1b[0m');
      };

      return () => {
        term.dispose();
        socket.close();
      };
    }
  }, []);

  return (
    <div
      id="terminal"
      ref={terminalRef}
      className='no-scrollbar'
      style={{
        backgroundColor: '#1e1e1e',
      }}
    />
  );
};

