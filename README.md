# Minnauz 2.0

Minnauz loyihasining yangi versiyasi. Ushbu monorepo uchta mustaqil qismdan tashkil topgan: frontend uchun Web (Next.js), backend uchun API (NestJS) va sun'iy intellekt integratsiyalari uchun Model Context Protocol (MCP) Server.

## Loyiha Tuzilmasi

- **/web** - Frontend ilovasi (Next.js). Odatiy holatda **3000** portda ishlaydi.
- **/api** - Backend API (NestJS). Odatiy holatda **3001** portda ishlaydi.
- **/mcp-server** - Mustaqil Model Context Protocol (MCP) server. Odatiy holatda **3002** portda Streamable HTTP orqali ishlaydi va ChatGPT/Claude kabi AI klientlariga MinnaUz platformasi bilan xavfsiz muloqot qilish imkonini beradi.

## Qanday Ishga Tushirish Kerak

### Frontend (Web)
```bash
cd web
npm install
npm run dev
```
Web ilova [http://localhost:3000](http://localhost:3000) manzilida ishga tushadi.

### Backend (API)
```bash
cd api
npm install
npm run start:dev
```
API ilova [http://localhost:3001](http://localhost:3001) manzilida ishga tushadi.

### MCP Server (AI Integratsiya)
```bash
cd mcp-server
npm install
npm run dev
```
MCP server [http://localhost:3002](http://localhost:3002) manzilida ishga tushadi. Streamable HTTP marshruti: `http://localhost:3002/mcp`.

## Texnologiyalar
- **Web**: Next.js, React, Tailwind CSS
- **API**: NestJS, TypeScript, Prisma, PostgreSQL
- **MCP Server**: TypeScript, Model Context Protocol SDK (`@modelcontextprotocol/sdk`), Express, Zod, Vitest
