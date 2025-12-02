import { FastifyInstance } from "fastify";
import { SlaService } from "../../Monitoring/slaTra/slaService";
import { SlaReportGenerator } from "../../Monitoring/slaTra/slaReportGenerator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function slaRoutes(app: FastifyInstance)
{
  app.get("/sla/:serviceId/:period", {
    schema: {
      tags: ["SLA"],
      summary: "Gerar relatório de SLA de um serviço",
      params: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          period: { 
            type: "string", 
            description: "Período (ex: 'last-7d', 'last-30d', '2025-01')" 
          },
        },
        required: ["serviceId", "period"],
      },
      querystring: {
        type: "object",
        properties: {
          format: { 
            type: "string", 
            enum: ["json", "pdf"], 
            default: "json" 
          },
        },
      },
      response: {
        200: {
          oneOf: [
            {
              type: "object",
              properties: {
                service: { type: "string" },
                period: { type: "string" },
                sla: {
                  type: "object",
                  properties: {
                    uptimePercentage: { type: "number" },
                    downtimeMinutes: { type: "number" },
                    incidents: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
            { type: "string", description: "PDF stream" },
          ],
        },
      },
    },
    handler: async (req, reply) => {
      const { serviceId, period } = req.params as any;
      const { format } = req.query as any;

      // Buscar serviço
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) return reply.status(404).send({ error: "Serviço não encontrado" });

      const { start, end } = SlaService.parsePeriod(period);
      const sla = await SlaService.getSlaReport(serviceId, start, end);
      const history = await SlaService.getSlaHistory(serviceId, start, end, "day");

      if (format === "pdf") {
        const pdfBuffer = await SlaReportGenerator.generatePDF(
          service.name,
          sla,
          start,
          end
        );

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename="sla-${service.name}-${period}.pdf"`
        );

        return reply.send(pdfBuffer);
      }

      return { service: service.name, period, sla, history };
    },
  });
}
