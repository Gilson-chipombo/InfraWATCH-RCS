'use client'
import CodeMirror from "@uiw/react-codemirror"
import { sql } from "@codemirror/lang-sql"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/src/components/ui/accordionSqlEditor"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/src/components/ui/resizable"

import { useMutation, useQuery } from "@tanstack/react-query"
import { runQuery } from "@/src/actions/sql/runQuery"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Service } from "@/src/types/interfaces"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Table2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export default function Overview({ service }: { service: Service }) {
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [columns, setColumns] = useState<any[]>([])
    const [code, setCode] = useState(`SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public'
         ORDER BY table_name;`)
    const [queryResult, setQueryResult] = useState<any[] | null>(null)
    const { theme: themeCode } = useTheme();

    // 2 - Buscar tabelas
    const {
        data: tables,
        error: errorTables,
        isLoading: isLoadingTables,
    } = useQuery({
        queryKey: ["tables", service?.dbUrl],
        queryFn: () =>
            runQuery(
                service!.dbUrl || "",
                `SELECT table_name
             FROM information_schema.tables
             WHERE table_schema = 'public'
             ORDER BY table_name;`,
            ),
        enabled: !!service?.dbUrl,
    })

    // 3 - Buscar colunas da tabela selecionada
    const fetchColumns = useMutation({
        mutationFn: (tableName: string) =>
            runQuery(
                service!.dbUrl || "",
                `SELECT column_name, data_type
             FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = '${tableName}'
             ORDER BY ordinal_position;`,
            ),
        onSuccess: (data) => setColumns(data),
    })

    // 4 - Executar SQL escrito no editor
    const executeQuery = useMutation({
        mutationFn: async () => {
            if (!service?.dbUrl) return []
            return runQuery(service.dbUrl, code)
        },
        onSuccess: (data) => setQueryResult(data),
    })

    const handleSelectTable = (table: string) => {
        setSelectedTable(table)
        fetchColumns.mutate(table)
    }

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full">

            <ResizablePanel defaultSize={15} minSize={15}>
                <div className="p-4 h-full overflow-y-auto scrollbar-thin">
                    <h2 className="font-bold mb-2">Tabelas:</h2>
                    {isLoadingTables && <p>Carregando tabelas...</p>}
                    {errorTables instanceof Error && <p>Erro: {errorTables.message}</p>}

                    <div className="space-y-1">
                        {tables?.map((row: any, i: number) => (
                            <Accordion type="single" collapsible key={i} onClick={() => handleSelectTable(row.table_name)}>
                                <AccordionItem value={`item-${i}`}>
                                    <AccordionTrigger className="justify-start text-muted-foreground">
                                        <Table2 className="w-4 h-4 mr-2" />
                                        {row.table_name}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {selectedTable === row.table_name ? (
                                            <>
                                                {fetchColumns.isPending ? (
                                                    <Skeleton className="h-[20px] w-[200px] rounded-sm" />
                                                ) : (
                                                    columns.map((col: any, idx: number) => (
                                                        <div key={idx} className="pl-6 border-l flex gap-3 items-center">
                                                            <span className="text-sm">{col.column_name}</span>
                                                            <span className="text-xs text-muted-foreground italic">{col.data_type}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </>
                                        ) : (<></>)}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={75}>
                <ResizablePanelGroup direction="vertical" className="h-full">

                    <ResizablePanel defaultSize={40} minSize={20}>
                        <div className="h-full flex flex-col bg-background">

                            <div className="p-2 border-b flex justify-end">
                                <Button
                                    onClick={() => executeQuery.mutate()}
                                    disabled={executeQuery.isPending}
                                >
                                    {executeQuery.isPending ? "Executando..." : "Executar"}
                                </Button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <CodeMirror
                                    value={code}
                                    height="100%"
                                    extensions={[sql()]}
                                    onChange={(value) => setCode(value)}
                                    theme={themeCode === "dark" ? "dark" : "light"}
                                    className="h-full w-full bg-background text-foreground no-scrollbar"
                                />
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel>
                        <div className="h-full overflow-auto scrollbar-thin">
                            {queryResult && (
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            {Object.keys(queryResult[0] || {}).map((key) => (
                                                <th key={key} className="text-left px-3 py-2 border-b">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queryResult.map((row: any, idx: number) => (
                                            <tr key={idx} className="border-t border-border">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-3 py-1 border-b border-r">
                                                        {String(val)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
