export interface SlaResult {
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  uptimePercentage: number | null;
  uptimePercentageByTime: number | null;
  upDurationMs: number | null;
  downDurationMs: number | null;
  unknownDurationMs: number | null;
}

export interface CheckData {
  timestamp: Date;
  status: "up" | "down" | "unknown";
  responseTime?: number;
}

export class SlaCalculator {
  static calculate(
    checks: CheckData[],
    startDate: Date,
    endDate: Date
  ): SlaResult {
    if (!Array.isArray(checks)) {
      console.error(
        'Erro: O parâmetro "checks" deve ser um array. Valor recebido:',
        checks
      );
      return {
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        uptimePercentage: null,
        uptimePercentageByTime: null,
        upDurationMs: null,
        downDurationMs: null,
        unknownDurationMs: null,
      };
    }

    if (checks.length === 0) {
      return {
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        uptimePercentage: null,
        uptimePercentageByTime: null,
        upDurationMs: null,
        downDurationMs: null,
        unknownDurationMs: null,
      };
    }
    const periodChecks = checks.filter(
      (check) => check.timestamp >= startDate && check.timestamp <= endDate
    );

    if (periodChecks.length === 0) {
      return {
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        uptimePercentage: null,
        uptimePercentageByTime: null,
        upDurationMs: null,
        downDurationMs: null,
        unknownDurationMs: null,
      };
    }

    periodChecks.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const totalChecks = periodChecks.length;
    const upChecks = periodChecks.filter(
      (check) => check.status === "up"
    ).length;
    const downChecks = periodChecks.filter(
      (check) => check.status === "down"
    ).length;
    const unknownChecks = periodChecks.filter(
      (check) => check.status === "unknown"
    ).length;

    const uptimePercentage =
      totalChecks > 0 ? (upChecks / totalChecks) * 100 : null;

    const totalPeriodMs = endDate.getTime() - startDate.getTime();
    let upDurationMs = 0;
    let downDurationMs = 0;
    let unknownDurationMs = 0;

    if (periodChecks.length === 1) {
      const status = periodChecks[0].status;
      if (status === "up") {
        upDurationMs = totalPeriodMs;
      } else if (status === "down") {
        downDurationMs = totalPeriodMs;
      } else {
        unknownDurationMs = totalPeriodMs;
      }
    } else {
      for (let i = 0; i < periodChecks.length - 1; i++) {
        const currentCheck = periodChecks[i];
        const nextCheck = periodChecks[i + 1];
        const duration =
          nextCheck.timestamp.getTime() - currentCheck.timestamp.getTime();

        if (currentCheck.status === "up") {
          upDurationMs += duration;
        } else if (currentCheck.status === "down") {
          downDurationMs += duration;
        } else {
          unknownDurationMs += duration;
        }
      }

      const lastCheck = periodChecks[periodChecks.length - 1];
      const lastDuration = endDate.getTime() - lastCheck.timestamp.getTime();

      if (lastCheck.status === "up") {
        upDurationMs += lastDuration;
      } else if (lastCheck.status === "down") {
        downDurationMs += lastDuration;
      } else {
        unknownDurationMs += lastDuration;
      }
    }

    const uptimePercentageByTime =
      totalPeriodMs > 0 ? (upDurationMs / totalPeriodMs) * 100 : null;

    return {
      totalChecks,
      upChecks,
      downChecks,
      uptimePercentage,
      uptimePercentageByTime,
      upDurationMs,
      downDurationMs,
      unknownDurationMs,
    };
  }

  static calculateByPeriods(
    checks: CheckData[],
    startDate: Date,
    endDate: Date,
    intervalMs: number
  ): Array<{ period: { start: Date; end: Date }; sla: SlaResult }> {
    if (!Array.isArray(checks)) {
      console.error(
        'Erro: O parâmetro "checks" deve ser um array. Valor recebido:',
        checks
      );
      return [];
    }

    const results: Array<{
      period: { start: Date; end: Date };
      sla: SlaResult;
    }> = [];

    let currentStart = new Date(startDate);

    while (currentStart < endDate) {
      const currentEnd = new Date(
        Math.min(currentStart.getTime() + intervalMs, endDate.getTime())
      );

      const periodSla = this.calculate(checks, currentStart, currentEnd);

      results.push({
        period: {
          start: new Date(currentStart),
          end: new Date(currentEnd),
        },
        sla: periodSla,
      });

      currentStart = new Date(currentEnd);
    }

    return results;
  }

  static generateSampleData(
    startDate: Date,
    endDate: Date,
    intervalMinutes: number = 5,
    uptimePercentage: number = 99.5
  ): CheckData[] {
    const checks: CheckData[] = [];
    const intervalMs = intervalMinutes * 60 * 1000;

    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
      const isUp = Math.random() * 100 < uptimePercentage;

      checks.push({
        timestamp: new Date(currentTime),
        status: isUp ? "up" : "down",
        responseTime: isUp ? Math.floor(Math.random() * 200) + 50 : undefined,
      });

      currentTime = new Date(currentTime.getTime() + intervalMs);
    }

    return checks;
  }
}
