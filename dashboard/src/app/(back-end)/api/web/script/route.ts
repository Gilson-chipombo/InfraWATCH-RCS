import puppeteer from "puppeteer";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const {
        goto,
        timeout = 15000,
        evaluateScript = 'return { message: "Nenhum script enviado" }',
    } = body;

    console.log(body);

    try {
        const browserlessUrl =
            process.env.BROWSERLESS_URL || "ws://127.0.0.1:3008"; // URL do teu container

        const apiKey = process.env.BROWSERLESS_API_KEY; // opcional se estiver configurado

        // Conectar ao Browserless (com ou sem API Key)
        const connectUrl = apiKey
            ? `${browserlessUrl}?token=${apiKey}`
            : browserlessUrl;

        const browser = await puppeteer.connect({
            browserWSEndpoint: connectUrl,
        });

        const page = await browser.newPage();

        await page.goto(goto, {
            waitUntil: "networkidle2",
            timeout,
        });

        // Executar script recebido
        const result = await page.evaluate(new Function(evaluateScript) as any);

        await browser.close();

        return new Response(JSON.stringify({ success: true, data: result }), {
            headers: { "Content-Type": "application/json" },
        });
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
