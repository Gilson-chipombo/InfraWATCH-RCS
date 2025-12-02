import puppeteer from "puppeteer";
import { NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    goto,
    timeout = 15000,
    httpUrl, // URL opcional para buscar dados via axios
  } = body;

  try {
    if (!goto) {
      throw new Error("URL 'goto' é obrigatória.");
    }

    // Configuração da URL do Browserless
    const browserlessUrl =
      process.env.BROWSERLESS_URL || "ws://127.0.0.1:3008"; // se estiver fora do Docker
    const apiKey = process.env.BROWSERLESS_API_KEY;

    // Montar endpoint de conexão
    const connectUrl = apiKey
      ? `${browserlessUrl}?token=${apiKey}`
      : browserlessUrl;

    // Conectar ao Browserless em vez de lançar Chrome local
    const browser = await puppeteer.connect({
      browserWSEndpoint: connectUrl,
    });

    const page = await browser.newPage();

    await page.goto(goto, {
      waitUntil: "networkidle2",
      timeout,
    });

    // Screenshot em base64
    const screenshot = await page.screenshot({
      encoding: "base64",
      fullPage: true,
    });

    // Buscar dados via axios (opcional)
    let httpData = null;
    if (httpUrl) {
      const response = await axios.get(httpUrl);
      httpData = response.data;
    }

    await browser.close();

    return new Response(
      JSON.stringify({
        success: true,
        httpData,
        screenshot: `data:image/png;base64,${screenshot}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || err.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
