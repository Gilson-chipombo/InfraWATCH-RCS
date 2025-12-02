"use server";

import fs from "fs";
import path from "path";

export async function saveJSON(data: any, fileName: string): Promise<boolean> {
  try {
    const dir = path.join(process.cwd(), "Topologies");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    return true;
  } catch (err) {
    console.error("Erro ao salvar JSON:", err);
    return false;
  }
}

export async function listTopologies(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), "Topologies");
    if (!fs.existsSync(dir)) {
      return [];
    }

    const data = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
    return data

  } catch (err) {
    console.error("Erro ao listar topologias:", err);
    return [];
  }
}

export async function getTopology(fileName: string): Promise<any | null> {
  try {
    const filePath = path.join(process.cwd(), "Topologies", fileName);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Erro ao ler topologia:", err);
    return null;
  }
}

export async function deleteTopology(fileName: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), "Topologies", fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`Arquivo ${fileName} não encontrado para exclusão.`);
      return false;
    }

    fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error("Erro ao deletar topologia:", err);
    return false;
  }
}