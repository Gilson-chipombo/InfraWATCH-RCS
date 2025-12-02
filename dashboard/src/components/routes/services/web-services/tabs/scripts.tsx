"use client"

import type React from "react"

import { Input } from "@/src/components/ui/input"
import type { Service } from "@/src/types/interfaces"
import { useState } from "react"
import { toast } from "sonner"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/src/components/ui/resizable"
import { Button } from "@/src/components/ui/button"
import ReactCodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes"
import { javascript } from "@codemirror/lang-javascript"

export default function Scripts({ service }: { service: Service }) {
  const [script, setScript] = useState<string>(`return (() => {
  const title = document.title;

  const metas = Array.from(document.querySelectorAll("meta")).map(meta => {
    const attrs = {};
    for (const attr of meta.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  });

  return { title, metas };
})();
`)
  const [result, setResult] = useState<any>(null)
  const [host, setHost] = useState(service.host)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme: themeCode } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/web/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goto: host,
          evaluateScript: script,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro desconhecido")

      setResult(data.data)
    } catch (err: any) {
      toast.error(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px-49px)]">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={15}>
          <header className="flex h-[60px] items-center px-4 justify-between gap-2 border-b">
            <Input placeholder="goto" value={host} onChange={(e) => setHost(e.target.value)} />
            <Button onClick={handleSubmit}>{loading ? "Executando..." : "executar"}</Button>
          </header>

          <div className="flex flex-col h-[calc(100vh-70px-49px-60px)]">
            <div className="flex-1 overflow-hidden">
              <ReactCodeMirror
                value={script}
                height="100%"
                extensions={[javascript()]}
                onChange={(value) => setScript(value)}
                theme={themeCode === "dark" ? "dark" : "light"}
                className="h-full w-full bg-background text-foreground"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: false,
                  searchKeymap: true,
                }}
                style={{
                  fontSize: "14px",
                  overflow: "auto",
                }}
              />
            </div>

            <div className="h-[200px] grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-t bg-muted/50">
              <div className="border rounded-lg p-4 bg-background">
                <h3 className="text-sm font-semibold mb-2">Features</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Syntax highlighting</li>
                  <li>Line numbers</li>
                  <li>Code folding</li>
                  <li>Auto-completion</li>
                  <li>Bracket matching</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-background">
                <h3 className="text-sm font-semibold mb-2">Shortcuts</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Ctrl+/ - Toggle comment</li>
                  <li>Ctrl+D - Select next occurrence</li>
                  <li>Ctrl+F - Find</li>
                  <li>Ctrl+H - Replace</li>
                  <li>Tab - Indent</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-background">
                <h3 className="text-sm font-semibold mb-2">Languages</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>JavaScript</li>
                </ul>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full p-4 overflow-auto">
            <h3 className="text-sm font-semibold mb-4">Output</h3>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">Erro: {error}</p>
              </div>
            )}

            {result && (
              <div className="p-3 rounded-lg bg-muted border">
                <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}

            {!result && !error && (
              <p className="text-muted-foreground text-sm">Execute um script para ver os resultados aqui.</p>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
