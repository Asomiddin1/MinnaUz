import { env } from './config/env.js';
import { createMinnaUzMcpServer } from './server.js';
import { createHttpApp } from './transport/http.js';

async function bootstrap() {
  const { server, apiClient } = createMinnaUzMcpServer();
  const app = await createHttpApp(server, apiClient);

  const httpServer = app.listen(env.PORT, env.HOST, () => {
    console.log(`
=====================================================
🚀 MinnaUz Model Context Protocol (MCP) Server Active
=====================================================
📡 Transport: Streamable HTTP (Stateless)
🌐 Host:      http://${env.HOST}:${env.PORT}
🔌 MCP Route: http://${env.HOST}:${env.PORT}/mcp
🔍 Discovery: http://${env.HOST}:${env.PORT}/.well-known/oauth-protected-resource
🩺 Health:    http://${env.HOST}:${env.PORT}/health
🔗 API Base:  ${env.MINNAUZ_API_URL}
=====================================================
`);
  });

  // Graceful Shutdown
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Gracefully stopping MinnaUz MCP Server...`);
    httpServer.close(() => {
      console.log('✅ HTTP server closed. Process exiting.');
      process.exit(0);
    });

    // Force exit if drain takes longer than 10 seconds
    setTimeout(() => {
      console.error('⚠️ Forcefully terminating after 10s drain window.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error in MinnaUz MCP Server:', err);
  process.exit(1);
});

