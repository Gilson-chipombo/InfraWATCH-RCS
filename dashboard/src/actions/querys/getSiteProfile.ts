"use server"

import puppeteer from "puppeteer"

export const getSiteProfile = async ({ goto }: { goto: string }) => {
  const timeout = 15000

  try {
    if (!goto) {
      throw new Error("URL 'goto' é obrigatória.")
    }

    const browser = await puppeteer.launch({
      headless: true,
      // executablePath: "/usr/bin/chromium", // 👈 usa o binário do sistema
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // importante no Docker
    })

    const page = await browser.newPage()

    await page.goto(goto, {
      waitUntil: "networkidle2",
      timeout,
    })

    const screenshot = await page.screenshot({
      encoding: "base64",
      fullPage: true,
    })

    await browser.close()

    return {
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || err.toString(),
    }
  }
}
