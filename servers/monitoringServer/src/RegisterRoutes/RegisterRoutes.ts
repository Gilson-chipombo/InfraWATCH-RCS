import jwtPlugin from '../plugins/jwt';
import prisma from "../plugins/prisma.js";
import { FastifyInstance } from "fastify";
import { servicesRoutes } from '../routes/APIs/servicesRoutes';
import { notificationRoutes } from '../routes/APIs/notificationRoutes';
import { serviceMetricsRoutes } from '../routes/APIs/serviceMetricsRoutes';
import { alertContactRoutes } from '../routes/APIs/alertContactRoutes';
import { notificationPolicyRoutes } from '../routes/APIs/notificationPolicy';
import { incidentRoutes } from '../routes/APIs/IncidentsRoutes';
import { slaRoutes } from "../routes/APIs/slaRoutes";
import { proxyReceiverRoutes } from "../routes/APIs/proxyReceiverRoutes";

export async function RegisterAllRoutes(app: FastifyInstance)
{    
    app.register(prisma);
    app.register(jwtPlugin);
    app.register(proxyReceiverRoutes);
    app.register(slaRoutes, { prefix: "/api" });
    app.register(servicesRoutes);
    app.register(alertContactRoutes);
    app.register(notificationRoutes);
    app.register(serviceMetricsRoutes);
    app.register(notificationPolicyRoutes);
    app.register(incidentRoutes, { prefix: '/api/incidents' });
}
