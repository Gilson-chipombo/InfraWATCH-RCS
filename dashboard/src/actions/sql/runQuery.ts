"use server"

import { Client } from "pg"

export async function runQuery(dbUrl: string, query: string) {
  if (!dbUrl) throw new Error("Database URL não fornecida")
  if (!query) throw new Error("Query não pode ser vazia")

  const client = new Client({ connectionString: dbUrl })

  try {
    await client.connect()
    const result = await client.query(query)
    return result.rows
  } catch (error: any) {
    throw new Error(`Erro ao executar query: ${error.message}`)
  } finally {
    await client.end()
  }
}
