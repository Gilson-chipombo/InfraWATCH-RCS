"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { GetServices, GetServiceSLA, DownloadServiceSLAPDF } from "@/src/actions/querys/getServiceSLA";
import { cn } from "@/src/lib/utils";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/src/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Download, TrendingUp, Gauge, AlertCircle, CheckCircle2,
} from "lucide-react";

// =============================
// Funções auxiliares
// =============================
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <p className="label text-gray-700 dark:text-gray-300 font-medium">{`${label}`}</p>
        <p className="intro text-blue-600 font-semibold">
          {payload[0].name === "Uptime"
            ? `${payload[0].value}%`
            : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, icon: Icon, trend, className }: any) => (
  <Card className={cn("bg-white dark:bg-gray-800 border-0 shadow-sm", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {trend && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {trend.value > 0 ? "+" : ""}
          {trend.value}% desde {trend.period}
        </p>
      )}
    </CardContent>
  </Card>
);

// =============================
// Componente Principal
// =============================
export default function SLADashboard() {
  const { theme } = useTheme();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState("1d");
  const [apiData, setApiData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Carregar lista de serviços
  useEffect(() => {
    GetServices()
      .then((data: any) => {
        if (!data.error) {
          setServices(data);
          if (data.length > 0) setSelectedService(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // 🔹 Carregar SLA
  useEffect(() => {
    if (!selectedService) return;
    setLoading(true);
    GetServiceSLA({ serviceId: selectedService, period: selectedPeriod })
      .then((data: any) => {
        if (!data.error) setApiData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedService, selectedPeriod]);

  // 🔹 Dados derivados
  const derivedData = useMemo(() => {
    if (!apiData) return null;
    const { sla } = apiData;

    return {
      numero: `SLA${sla.serviceId.slice(0, 8)}`,
      dataGeracao: new Date().toLocaleDateString("pt-BR"),
      periodoInicio: formatDate(sla.start),
      periodoFim: formatDate(sla.end),
      totalVerificacoes: sla.totalChecks,
      verificacoesUp: sla.upChecks,
      verificacoesDown: sla.downChecks,
      uptimeAmostras: Number(sla.uptimePercentage.toFixed(2)),
      uptimeTempo: Number(sla.uptimePercentageByTime.toFixed(2)),
      tempoAtivo: formatDuration(sla.upDurationMs),
      tempoInativo: formatDuration(sla.downDurationMs),
      tempoDesconhecido: formatDuration(sla.unknownDurationMs),
      disponibilidadeGeral: Number(sla.uptimePercentage.toFixed(2)),
      observacoes: `Análise de disponibilidade do serviço '${apiData.service}' no período de ${formatDate(
        sla.start
      )} a ${formatDate(sla.end)}. Dados baseados em ${
        sla.totalChecks
      } verificações automáticas pelo sistema de monitoramento.`,
    };
  }, [apiData]);

  const COLORS = {
    success: "#10b981",
    danger: "#ef4444",
    neutral: "#6b7280",
    primary: "#3b82f6",
  };

  const pieData =
    apiData && derivedData
      ? [
          { name: "UP", value: derivedData.verificacoesUp, color: COLORS.success },
          { name: "DOWN", value: derivedData.verificacoesDown, color: COLORS.danger },
          {
            name: "Desconhecido",
            value: Math.round(apiData.sla.unknownDurationMs / apiData.sla.inferredSampleIntervalMs),
            color: COLORS.neutral,
          },
        ]
      : [];

  // 🔹 Download PDF via server action
  const handleDownloadPDF = async () => {
    try {
      const blob = await DownloadServiceSLAPDF({
        serviceId: selectedService,
        period: selectedPeriod,
      });

      if ((blob as any).error) throw new Error("Falha ao gerar PDF");

      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sla-${selectedService}-${selectedPeriod}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar PDF", err);
    }
  };

  if (loading || !apiData || !derivedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Carregando dados SLA...</p>
      </div>
    );
  }

  // 🔹 Retorna o mesmo JSX (cards, gráficos, métricas etc.)
  return (
     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios & SLA
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Download size={18} />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium pr-12 text-gray-700 dark:text-gray-300">
                Serviço:
              </span>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-48 bg-gray-50 dark:bg-gray-800">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Período:
              </span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40 bg-gray-50 dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Último dia</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Verificações"
            value={derivedData.totalVerificacoes.toLocaleString()}
            icon={TrendingUp}
          />
          <MetricCard
            title="UP"
            value={derivedData.verificacoesUp.toLocaleString()}
            icon={CheckCircle2}
          />
          <MetricCard
            title="DOWN"
            value={derivedData.verificacoesDown}
            icon={AlertCircle}
          />
          <MetricCard
            title="Disponibilidade"
            value={`${derivedData.disponibilidadeGeral}%`}
            icon={Gauge}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Histórico real */}
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Desempenho Histórico
              </CardTitle>
              <CardDescription>
                Variação do uptime no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={apiData.history}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                      strokeOpacity={0.3}
                    />
                    <XAxis dataKey="timestamp" stroke={theme === "dark" ? "#9ca3af" : "#374151"} />
                    <YAxis domain={[0, 100]} stroke={theme === "dark" ? "#9ca3af" : "#374151"} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="uptime"
                      name="Uptime"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie */}
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-6">
                Distribuição de Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          theme === "dark" ? "#111827" : "#ffffff",
                        border: `1px solid ${
                          theme === "dark" ? "#374151" : "#e5e7eb"
                        }`,
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Duração */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tempo Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-green-600">
                {derivedData.tempoAtivo}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tempo Inativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-red-600">
                {derivedData.tempoInativo}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tempo Desconhecido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                {derivedData.tempoDesconhecido}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                <span className="text-sm font-medium">Uptime por Amostras</span>
                <span className="text-lg font-semibold text-blue-600">
                  {derivedData.uptimeAmostras}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                <span className="text-sm font-medium">Uptime por Tempo</span>
                <span className="text-lg font-semibold text-green-600">
                  {derivedData.uptimeTempo}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                <span className="text-sm font-medium">Intervalo de Amostragem</span>
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {Math.round(apiData.sla.inferredSampleIntervalMs / 1000)}s
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise e Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {derivedData.observacoes}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
