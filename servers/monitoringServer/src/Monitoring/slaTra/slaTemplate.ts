// slaTemplate.ts
import { SlaResult } from "./slaCalculator";

export function renderRcsSlaReport(
  serviceName: string,
  sla: SlaResult,
  start: Date,
  end: Date,
  logoPath?: string
): string {
  const uptimeSamples =
    sla.uptimePercentage == null
      ? "Sem dados"
      : `${sla.uptimePercentage.toFixed(2)}%`;

  const uptimeByTime =
    typeof sla.uptimePercentageByTime === "number"
      ? `${sla.uptimePercentageByTime.toFixed(2)}%`
      : "—";

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${h}h ${m}m ${ss}s`;
  };

  const getStatusInfo = (uptime: number | null) => {
    if (uptime === null)
      return { color: "#6B7280", text: "Sem dados", class: "unknown" };
    if (uptime >= 99.9)
      return { color: "#10B981", text: "Excelente", class: "excellent" };
    if (uptime >= 99.0) return { color: "#F59E0B", text: "Bom", class: "good" };
    return { color: "#EF4444", text: "Crítico", class: "critical" };
  };

  const statusInfo = getStatusInfo(sla.uptimePercentage);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reportId = `SLA${Date.now().toString().slice(-8)}${Math.floor(
    Math.random() * 100
  )
    .toString()
    .padStart(2, "0")}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório SLA - ${serviceName} - RCS Angola</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      color: #333;
      line-height: 1.4;
    }

    .page {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      min-height: 297mm;
      position: relative;
    }

    /* Marca d'água */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 6rem;
      font-weight: 900;
      color: rgba(74, 144, 226, 0.03);
      z-index: 0;
      pointer-events: none;
      user-select: none;
      font-family: Arial, sans-serif;
    }

    .content {
      position: relative;
      z-index: 1;
      padding: 40px;
    }

    /* Cabeçalho */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 3rem;
      font-weight: bold;
      color: #4a90e2;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .company-details {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.3;
    }

    .logo-area {
      width: 120px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #4a90e2;
      font-weight: bold;
      font-size: 0.9rem;
    }

    /* Linha separadora */
    .separator {
      height: 4px;
      background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%);
      margin: 20px 0;
      border-radius: 2px;
    }

    /* Título do relatório */
    .report-title {
      text-align: center;
      background: #4a90e2;
      color: white;
      padding: 20px;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 30px;
    }

    /* Informações do relatório */
    .report-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }

    .info-section {
      border-left: 4px solid #4a90e2;
      padding-left: 20px;
    }

    .info-section h3 {
      color: #4a90e2;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      font-weight: 600;
    }

    /* Tabela principal de métricas */
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .metrics-table th {
      background: #f1f5f9;
      color: #334155;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }

    .metrics-table td {
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.95rem;
    }

    .metrics-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .metric-name {
      font-weight: 500;
      color: #475569;
    }

    .metric-value {
      font-weight: 600;
      text-align: right;
    }

    .metric-unit {
      color: #64748b;
      font-weight: normal;
      font-size: 0.85rem;
    }

    /* Status visual */
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-excellent {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-good {
      background: #fef3c7;
      color: #d97706;
    }

    .status-critical {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-unknown {
      background: #f1f5f9;
      color: #64748b;
    }

    /* Barra de progresso visual */
    .progress-section {
      margin: 30px 0;
      padding: 25px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .progress-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      height: 24px;
      background: #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      margin: 15px 0;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      width: ${sla.uptimePercentage || 0}%;
      border-radius: 12px;
      position: relative;
    }

    .progress-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.85rem;
      font-weight: 600;
      color: #1f2937;
      text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    }

    .progress-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #64748b;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-dot.active {
      background: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .legend-dot.inactive {
      background: #6b7280;
      box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
    }

    /* Totais */
    .totals-section {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.95rem;
    }

    .total-label {
      color: #475569;
      font-weight: 500;
    }

    .total-value {
      font-weight: 600;
      color: #1e293b;
    }

    .grand-total {
      background: #4a90e2;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-top: 15px;
      font-size: 1.1rem;
      font-weight: 700;
    }

    /* Observações */
    .observations {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin-top: 30px;
      border-radius: 0 8px 8px 0;
    }

    .observations h4 {
      color: #d97706;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .observations p {
      color: #92400e;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 40px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.8rem;
      color: #64748b;
    }

    .page-number {
      font-weight: 500;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      .page {
        margin: 0;
        box-shadow: none;
      }
      
      .content {
        padding: 20px;
      }
      
      .header {
        flex-direction: column;
        gap: 20px;
      }
      
      .company-name {
        font-size: 2rem;
      }
      
      .report-info {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .metrics-table {
        font-size: 0.9rem;
      }
      
      .metrics-table th,
      .metrics-table td {
        padding: 10px;
      }
    }

    /* Print styles */
    @media print {
      body {
        background: white;
      }
      
      .page {
        box-shadow: none;
        margin: 0;
        max-width: none;
      }
      
      .watermark {
        color: rgba(74, 144, 226, 0.05) !important;
      }
      
      .report-title, .grand-total {
        background: #4a90e2 !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .progress-fill {
        background: #10b981 !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="watermark">SLA REPORT</div>
    
    <div class="content">
      <!-- Cabeçalho -->
      <div class="header">
        <div class="company-info">
          <div class="company-name">RCS</div>
          <div class="company-details">
            Luanda, Angola<br>
            Call Center: +244 932 896 190
          </div>
        </div>
        <div class="logo-area">
          ${
            logoPath
              ? `<img src="${logoPath}" alt="RCS Angola" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`
              : "RCS<br>ANGOLA"
          }
        </div>
      </div>

      <div class="separator"></div>

      <!-- Título do relatório -->
      <div class="report-title">
        RELATÓRIO DE SLA
      </div>

      <!-- Informações do relatório -->
      <div class="report-info">
        <div class="info-section">
          <h3>Detalhes do Relatório</h3>
          <div class="info-row">
            <span class="info-label">Número:</span>
            <span class="info-value">${reportId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data de Geração:</span>
            <span class="info-value">${formatDate(new Date())}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Período de Análise:</span>
            <span class="info-value">${Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            )} dias</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status-indicator status-${statusInfo.class}">
                ${statusInfo.text}
              </span>
            </span>
          </div>
        </div>

        <div class="info-section">
          <h3>Informações do Serviço</h3>
          <div class="info-row">
            <span class="info-label">Serviço:</span>
            <span class="info-value">${serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Período Início:</span>
            <span class="info-value">${formatDateTime(start)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Período Fim:</span>
            <span class="info-value">${formatDateTime(end)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo de Relatório:</span>
            <span class="info-value">SLA Automático</span>
          </div>
        </div>
      </div>

      <!-- Tabela de métricas -->
      <table class="metrics-table">
        <thead>
          <tr>
            <th>MÉTRICA</th>
            <th style="text-align: center;">VALOR</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="metric-name">Total de Verificações</td>
            <td class="metric-value" style="text-align: center;">${sla.totalChecks.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="metric-name">Verificações UP</td>
            <td class="metric-value" style="text-align: center; color: #10b981;">${sla.upChecks.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="metric-name">Verificações DOWN</td>
            <td class="metric-value" style="text-align: center; color: #ef4444;">${sla.downChecks.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="metric-name">Uptime (por amostras)</td>
            <td class="metric-value" style="text-align: center; color: ${
              statusInfo.color
            }; font-size: 1.1rem;">${uptimeSamples}</td>
          </tr>
          <tr>
            <td class="metric-name">Uptime (por tempo)</td>
            <td class="metric-value" style="text-align: center; color: #4a90e2;">${uptimeByTime}</td>
          </tr>
        </tbody>
      </table>

      <!-- Barra de progresso visual -->
      <br>
      <br>
      <br>
      <div class="progress-section">
        <div class="progress-title">
          Visualização da Disponibilidade
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
          <div class="progress-label">${uptimeSamples}</div>
        </div>
        <div class="progress-legend">
          <div class="legend-item">
            <div class="legend-dot active"></div>
            <span>Tempo Ativo</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot inactive"></div>
            <span>Tempo Inativo/Desconhecido</span>
          </div>
        </div>
      </div>

      <!-- Totais -->
      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">Tempo Total Ativo:</span>
          <span class="total-value" style="color: #10b981;">${fmt(
            sla.upDurationMs ?? 0
          )}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Tempo Total Inativo:</span>
          <span class="total-value" style="color: #ef4444;">${fmt(
            sla.downDurationMs ?? 0
          )}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Tempo Desconhecido:</span>
          <span class="total-value" style="color: #6b7280;">${fmt(
            sla.unknownDurationMs ?? 0
          )}</span>
        </div>

        <div class="grand-total">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>DISPONIBILIDADE GERAL:</span>
            <span style="font-size: 1.3rem;">${uptimeSamples}</span>
          </div>
        </div>
      </div>

      <!-- Observações -->
      <div class="observations">
        <h4>Observações</h4>
        <p>
          Este relatório apresenta a análise de disponibilidade do serviço "${serviceName}" 
          no período de ${formatDateTime(start)} a ${formatDateTime(end)}. 
          Os dados são baseados em verificações automáticas realizadas pelo sistema de monitoramento 
          da RCS Angola. Para questões técnicas ou esclarecimentos, contacte o nosso Call Center.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Relatório gerado automaticamente em ${formatDateTime(
        new Date()
      )}</div>
      <div class="page-number">Página 1</div>
    </div>
  </div>
</body>
</html>
`;
}
