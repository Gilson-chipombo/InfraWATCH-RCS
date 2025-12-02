'use client'

import { generateToken } from "@/config/uitl1";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

export default function InfraShell({ className, data }: { className?: string, data?: any }) {
  const router = useRouter()
  const [history, setHistory] = useState([
    {
      command: "welcome",
      output: ["Bem-vindo ao Terminal Web v1.0.0", "Digite 'help' para ver os comandos disponíveis.", ""],
      timestamp: new Date(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState("remote");
  const [platform, setPlatform] = useState("web");
  const [system, setSystem] = useState("anonimo");

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [myself, setMyself] = useState("");
  const [token, setToken] = useState("");
  const [device, setDevice] = useState<any>({});

  const url = process.env.NEXT_PUBLIC_LINKER_URL as string

  // 🔹 Ajuste da função appendHistory
  const appendHistory = (cmd: string, output?: string[] | string, isLocal = false) => {
    if (!isLocal && output === undefined) return;
    setHistory((prev) => [
      ...prev,
      {
        command: cmd ?? "",
        output: output !== undefined
          ? (Array.isArray(output) ? output : [output])
          : [],
        timestamp: new Date(),
      },
    ]);
  };

  const handleSubmit = async () => {
    const command = currentInput.trim();
    if (!command) return;

    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentInput("");

    if (command === "clear") {
      setHistory([]);
      return;
    }

    if (command === "help") {
      appendHistory(command, [
        "Comandos disponíveis:",
        "  help          - Mostra esta ajuda",
        "  clear         - Limpa o terminal",
        "  shutdown      - Envia comando de desligar",
        "  show          - Mostra os tokens",
        "  device        - Informações do dispositivo",
        "",
      ], true);
      return;
    }

    if (command === "show") {
      appendHistory(command, [
        `Local  -> localhost\t\t\t${myself}`,
        `Remote -> ${device.user}\t\t\t${token}`,
      ], true);
      return;
    }

    if (command === "device") {
      appendHistory(command, [
        `TOKEN:\t\t${device.mytoken}`,
        `PLATFORM:\t${device.platform}`,
        `SYSTEM:\t\t${device.system}`,
        `USER:\t\t${device.user}`,
        `VERSION:\t${device.version}`,
      ], true);
      return;
    }

    if (command === "shutdown") {
      appendHistory(command, ["Enviando sinal..."]);
      try {
        const res = await fetch(`${url}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, myself, command }),
        });
        const msg = res.ok ? "Sinal enviado com sucesso." : `Erro: ${res.statusText}`;
        appendHistory(command, msg);
      } catch (err) {
        appendHistory(command, `Erro: ${err.message}`);
      }
    } else {
      try {
        await fetch(`${url}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, myself, command }),
        });
      } catch (err) {
        appendHistory(command, `Erro: ${err.message}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCurrentInput(commandHistory[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCurrentInput("");
      } else {
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex] || "");
      }
    }
  };

  useEffect(() => {
    const id = generateToken(16);
    const userToken = data?.password ?? "";

    setCurrentPath(data?.name || "remote");
    setPlatform(data?.password || "web");
    setSystem(data?.name || "anonimo");
    setDevice(data);
    setMyself(id);
    setToken(userToken);

    const url = process.env.NEXT_PUBLIC_LINKER_URL_WS as string
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("✅ Conectado ao servidor WS");

      socket.send(JSON.stringify({
        type: "register",
        token: id // 🔹 usa id direto, não o state
      }));
    });

    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.event === `info/${id}`) {
          appendHistory("info", msg.data.message, true);
        }
        

        if (msg.event === `response/${id}`) {
          console.log("📩 Resposta recebida:", msg.data?.stdout);
          if (typeof msg.data?.stdout === "object") {
            appendHistory(msg.command, JSON.stringify(msg.data.stdout, null, 5), true);
          } else {
            appendHistory(msg.command, msg.data.stdout || "sem resposta", true);
          }
        }
      } catch (err) {
        console.error("Erro ao processar mensagem:", err);
      }
    });

    socket.onclose = () => console.log("❌ WebSocket desconectado");
    socket.onerror = (err) => console.error("Erro WebSocket:", err);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`w-full h-screen mx-auto ${className}`}>
      <div className="bg-gray-900 h-full overflow-hidden">
        <div
          ref={terminalRef}
          className="bg-gray-900 text-green-400 font-mono text-sm p-4 h-full overflow-y-auto"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              {entry.command !== "welcome" && (
                <div className="flex">
                  <span className="text-purple-400">{currentPath}</span>
                  <span className="text-white">:</span>
                  <span className="text-blue-400">{platform}</span>
                  <span className="text-white">$ </span>
                  <span className="text-green-400 ml-2">{entry.command}</span>
                </div>
              )}
              {entry.output.map((line, i) => (
                <pre key={i} className="text-gray-300">{line}</pre>
              ))}
            </div>
          ))}

          <div className="flex items-center">
            <span className="text-purple-400">{currentPath}</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">{platform}</span>
            <span className="text-white">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ml-2 bg-transparent border-none outline-none text-green-400 flex-1 font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
