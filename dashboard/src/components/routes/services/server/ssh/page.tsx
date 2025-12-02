"use client";

import { useEffect, useState } from "react";

export default function SSHPage({id}:{id:string}) {
  const [command, setCommand] = useState("ls");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunCommand = async () => {
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/ssh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, id }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.output);
      } else {
        setError(data.error || "Erro desconhecido");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>SSH Remote Executor (Chave SSH)</h1>


      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Comando"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          style={{ width: "300px" }}
        />
        <button onClick={handleRunCommand} disabled={loading} style={{ marginLeft: "0.5rem" }}>
          {loading ? "Executando..." : "Executar"}
        </button>
      </div>

      {output && (
        <div >
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>Erro:</strong> {error}
        </div>
      )}
    </div>
  );
}