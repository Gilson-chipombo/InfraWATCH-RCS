import Fastify from "fastify";
import fastifyCors from "fastify-cors";
import { initSocket } from './socket';
import fastifySwagger from 'fastify-swagger';
import { startMonitoring } from './Monitoring/Workers/worker';
import { RegisterAllRoutes } from "./RegisterRoutes/RegisterRoutes";

const PORT = Number(process.env.PORT) || 300;
const SUBDOMAIN = process.env.LOCALTUNNEL_SUBDOMAIN;

const server = Fastify({ logger: false });

server.register(fastifyCors, {
  origin: [
    "http://212.85.1.223:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

server.register(fastifySwagger, {
  routePrefix: '/docs',
  swagger: {
    info: { title: 'InfraWatch API', description: 'API do InfraWatch', version: '0.1.0' },
    host: `${process.env.URL_PRODUCTION ? process.env.URL_PRODUCTION : "localhost"}:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true,
});

const start = async () => {
  try
  {
    RegisterAllRoutes(server);
    initSocket(server.server);
    await startMonitoring();

    await server.listen(PORT, '0.0.0.0');
    console.log(`Servidor Fastify rodando em http://localhost:${PORT}`);
    console.log(`Documentação disponível em http://localhost:${PORT}/docs`);
  }
  catch (err)
  {
    server.log.error(err);
    process.exit(1);
  }
};

start();