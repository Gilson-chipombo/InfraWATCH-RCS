import pdf from "html-pdf-node";
import path from "path";
import { SlaResult } from "./slaCalculator";
import { renderRcsSlaReport } from "./slaTemplate";

export class SlaReportGenerator {
  private static async getLogoAsBase64(
    logoPath?: string
  ): Promise<string | null> {
    try {
      const fs = await import("fs").then((m) => m.promises);
      const finalPath = logoPath
        ? logoPath.replace("file://", "")
        : path.join(process.cwd(), "src/assets/logo.png");

      const imageBuffer = await fs.readFile(finalPath);
      const base64 = imageBuffer.toString("base64");
      const mimeType = finalPath.endsWith(".png") ? "image/png" : "image/jpeg";

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn("Não foi possível carregar a logo:", error);
      return null;
    }
  }

  private static getPdfOptions() {
    return {
      format: "A4" as const,
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--allow-file-access-from-files",
        "--disable-features=VizDisplayCompositor",
        "--disable-extensions",
        "--disable-plugins",
        "--run-all-compositor-stages-before-draw",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--disable-ipc-flooding-protection",
      ],
      timeout: 90000,
      waitUntil: ["load", "domcontentloaded"] as (
        | "load"
        | "domcontentloaded"
      )[],
    };
  }

  private static optimizeSlaData(sla: SlaResult): SlaResult {
    return {
      ...sla,

      uptimePercentage: sla.uptimePercentage
        ? Math.round(sla.uptimePercentage * 100) / 100
        : null,
      uptimePercentageByTime: sla.uptimePercentageByTime
        ? Math.round(sla.uptimePercentageByTime * 100) / 100
        : null,
    };
  }

  static async generatePDF(
    serviceName: string,
    sla: SlaResult,
    start: Date,
    end: Date
  ): Promise<Buffer> {
    try {
      const logoBase64 = await this.getLogoAsBase64();

      const optimizedSla = this.optimizeSlaData(sla);
      const html = renderRcsSlaReport(
        serviceName,
        optimizedSla,
        start,
        end,
        logoBase64 || undefined
      );

      const file = { content: html };
      const options = this.getPdfOptions();

      console.log(`Gerando PDF para serviço: ${serviceName}`);
      const startTime = Date.now();

      const result = await pdf.generatePdf(file, options);

      const endTime = Date.now();
      console.log(`PDF gerado com sucesso em ${endTime - startTime}ms`);

      return result;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);

      try {
        console.log("Tentando geração de PDF com configurações básicas...");
        const basicOptions = {
          format: "A4" as const,
          printBackground: true,
          timeout: 60000,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        };

        const logoBase64 = await this.getLogoAsBase64();
        const optimizedSla = this.optimizeSlaData(sla);
        const html = renderRcsSlaReport(
          serviceName,
          optimizedSla,
          start,
          end,
          logoBase64 || undefined
        );
        const file = { content: html };

        return await pdf.generatePdf(file, basicOptions);
      } catch (fallbackError) {
        console.error("Erro no fallback de PDF:", fallbackError);
        throw new Error(
          `Falha na geração do PDF: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
    }
  }

  static async generatePDFWithLogo(
    serviceName: string,
    sla: SlaResult,
    start: Date,
    end: Date,
    logoPath?: string
  ): Promise<Buffer> {
    try {
      const logoBase64 = await this.getLogoAsBase64(logoPath);

      const optimizedSla = this.optimizeSlaData(sla);
      const html = renderRcsSlaReport(
        serviceName,
        optimizedSla,
        start,
        end,
        logoBase64 || undefined
      );

      const file = { content: html };
      const options = this.getPdfOptions();

      console.log(`Gerando PDF com logo para serviço: ${serviceName}`);
      const startTime = Date.now();

      const result = await pdf.generatePdf(file, options);

      const endTime = Date.now();
      console.log(
        `PDF com logo gerado com sucesso em ${endTime - startTime}ms`
      );

      return result;
    } catch (error) {
      console.error("Erro ao gerar PDF com logo:", error);

      try {
        console.log(
          "Tentando geração de PDF com logo usando configurações básicas..."
        );
        const basicOptions = {
          format: "A4" as const,
          printBackground: true,
          timeout: 60000,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        };

        const logoBase64 = await this.getLogoAsBase64(logoPath);
        const optimizedSla = this.optimizeSlaData(sla);
        const html = renderRcsSlaReport(
          serviceName,
          optimizedSla,
          start,
          end,
          logoBase64 || undefined
        );
        const file = { content: html };

        return await pdf.generatePdf(file, basicOptions);
      } catch (fallbackError) {
        console.error("Erro no fallback de PDF com logo:", fallbackError);
        throw new Error(
          `Falha na geração do PDF com logo: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
    }
  }

  static async generateHTML(
    serviceName: string,
    sla: SlaResult,
    start: Date,
    end: Date,
    logoPath?: string
  ): Promise<string> {
    const logoBase64 = await this.getLogoAsBase64(logoPath);
    return renderRcsSlaReport(
      serviceName,
      sla,
      start,
      end,
      logoBase64 || undefined
    );
  }

  static async savePDFToFile(
    serviceName: string,
    sla: SlaResult,
    start: Date,
    end: Date,
    outputPath: string,
    logoPath?: string
  ): Promise<void> {
    const fs = await import("fs").then((m) => m.promises);

    const pdfBuffer = logoPath
      ? await this.generatePDFWithLogo(serviceName, sla, start, end, logoPath)
      : await this.generatePDF(serviceName, sla, start, end);

    await fs.writeFile(outputPath, pdfBuffer);
  }

  static async generateSampleReport(
    serviceName: string = "Servidor Web Principal",
    outputPath?: string
  ): Promise<Buffer> {
    const { SlaCalculator } = await import("./slaCalculator");
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sampleData = SlaCalculator.generateSampleData(
      startDate,
      endDate,
      5,
      99.5
    );

    const sla = SlaCalculator.calculate(sampleData, startDate, endDate);

    const pdfBuffer = await this.generatePDF(
      serviceName,
      sla,
      startDate,
      endDate
    );

    if (outputPath) {
      const fs = await import("fs").then((m) => m.promises);
      await fs.writeFile(outputPath, pdfBuffer);
    }

    return pdfBuffer;
  }

  static async generateSimplePDF(
    serviceName: string,
    sla: SlaResult,
    start: Date,
    end: Date
  ): Promise<Buffer> {
    try {
      const optimizedSla = this.optimizeSlaData(sla);

      const simpleHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório SLA - ${serviceName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a90e2; padding-bottom: 20px; }
    .company { font-size: 2rem; color: #4a90e2; margin-bottom: 10px; }
    .title { font-size: 1.5rem; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f1f5f9; }
    .metric-value { font-weight: bold; text-align: right; }
    .status-good { color: #10b981; }
    .status-critical { color: #ef4444; }
    .footer { margin-top: 30px; text-align: center; font-size: 0.8rem; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">RCS Angola</div>
    <div class="title">Relatório de SLA</div>
    <p>Serviço: ${serviceName}</p>
    <p>Período: ${start.toLocaleDateString("pt-BR")} - ${end.toLocaleDateString(
        "pt-BR"
      )}</p>
  </div>
  
  <table>
    <tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td>Total de Verificações</td><td class="metric-value">${optimizedSla.totalChecks.toLocaleString()}</td></tr>
    <tr><td>Verificações UP</td><td class="metric-value status-good">${optimizedSla.upChecks.toLocaleString()}</td></tr>
    <tr><td>Verificações DOWN</td><td class="metric-value status-critical">${optimizedSla.downChecks.toLocaleString()}</td></tr>
    <tr><td>Uptime (por amostras)</td><td class="metric-value">${
      optimizedSla.uptimePercentage?.toFixed(2) || "N/A"
    }%</td></tr>
    <tr><td>Uptime (por tempo)</td><td class="metric-value">${
      optimizedSla.uptimePercentageByTime?.toFixed(2) || "N/A"
    }%</td></tr>
  </table>
  
  <div class="footer">
    <p>Relatório gerado automaticamente em ${new Date().toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}</p>
  </div>
</body>
</html>`;

      const basicOptions = {
        format: "A4" as const,
        printBackground: true,
        timeout: 30000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };

      console.log(`Gerando PDF simplificado para serviço: ${serviceName}`);
      return await pdf.generatePdf({ content: simpleHtml }, basicOptions);
    } catch (error) {
      console.error("Erro ao gerar PDF simplificado:", error);
      throw new Error(
        `Falha na geração do PDF simplificado: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }
}
