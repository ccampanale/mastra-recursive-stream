
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { demoAgent } from './agents/demo-agent';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, demoAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  server: {
    // middleware: [
    //   {
    //     path: '/api/*',
    //     handler: async (c, next) => {
    //       c.header('Access-Control-Allow-Origin', '*');
    //       c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    //       c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mastra-client-type');
    //       if (c.req.method === 'OPTIONS') {
    //         return new Response(null, { status: 204 });
    //       }
    //       await next();
    //     },
    //   },
    // ],
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    // stores observability, scores, ... into persistent file storage
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
