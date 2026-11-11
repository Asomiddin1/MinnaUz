# MinnaUz Model Context Protocol (MCP) Server

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](tsconfig.json)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](tests/)

Production-ready, independent **Model Context Protocol (MCP)** Server for the **MinnaUz** Japanese language learning platform.

The MCP Server enables AI clients (**ChatGPT**, **Claude**, **Cursor**, and custom agents) to securely connect to MinnaUz over standard **Streamable HTTP** (RFC-compliant) to query courses, vocabulary, kanji, JLPT exam drills, and personalized student learning progress.

---

## 1. Architecture Overview

```text
AI Client (ChatGPT / Claude / Cursor)
          |
          | (Streamable HTTP POST /mcp with Bearer Token)
          v
Nginx Reverse Proxy (mcp.minna.uz:443, proxy_buffering off)
          |
          v
MinnaUz MCP Server (Node.js / Express on Port 3002)
   ├── StreamableHTTPServerTransport (/mcp)
   ├── Discovery: /.well-known/oauth-protected-resource (RFC 9728)
   ├── Health: /health, /livez, /readyz
   └── Explicit SecurityContext (Per-Request Isolation)
          |
          | (Internal HTTP REST with Bearer Token Forwarding)
          v
MinnaUz NestJS Backend API (Port 3001)
          |
          v
PostgreSQL Database (Prisma ORM)
```

### Architectural Guarantees:
- **Zero Database Coupling:** The MCP server never connects directly to PostgreSQL and never loads Prisma.
- **Zero Raw Token Storage:** Plaintext tokens are never stored; access tokens are asymmetric stateless JWTs; refresh tokens and authorization codes are hashed with SHA-256.
- **Strict Tenant Isolation:** Every request context is passed explicitly as a `SecurityContext` parameter into tools and client calls, preventing cross-user token contamination.
- **No In-Chat Credential Pasting:** Remote AI clients authenticate via standard **OAuth 2.1 Authorization Code Flow with PKCE (`S256`)**.

---

## 2. Getting Started & Installation

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0
- Running MinnaUz Backend API (`api/` on port 3001)

### Installation
```bash
# From repository root
cd mcp-server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Environment Configuration (`.env`)
```env
NODE_ENV="development"
PORT=3002
HOST="0.0.0.0"

# Backend API base URL
MINNAUZ_API_URL="http://127.0.0.1:3001/api"

# OAuth Discovery URLs
MINNAUZ_AUTH_SERVER_URL="https://api.minna.uz"
MCP_RESOURCE_URL="https://mcp.minna.uz"

# Request Timeout
API_TIMEOUT_MS=10000

# Optional Local Developer Token (for testing with STDIO transport)
DEV_BEARER_TOKEN=""

# CORS Allowed Origins
CORS_ORIGINS="*"
```

---

## 3. Development & Build Commands

```bash
# Run in development mode with live-reload (tsx)
npm run dev

# Run in local CLI mode with Stdio transport (for Claude Desktop)
npm run stdio

# Run automated tests with Vitest
npm test

# Run tests with coverage report
npm run test:coverage

# Compile TypeScript to production dist/
npm run build

# Start production server
npm start
```

---

## 4. MCP Client Connection Instructions

### Connecting to Claude Desktop (Local STDIO Transport)
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "minnauz": {
      "command": "node",
      "args": ["/absolute/path/to/MinnaUz/mcp-server/dist/transport/stdio.js"],
      "env": {
        "MINNAUZ_API_URL": "http://127.0.0.1:3001/api",
        "DEV_BEARER_TOKEN": "<optional-personal-jwt-token>"
      }
    }
  }
}
```

### Connecting to ChatGPT (Remote MCP / Actions over HTTP)
1. In your GPT configuration or MCP connector, set the Server URL to:
   ```
   https://mcp.minna.uz/mcp
   ```
2. Set Authentication Type to **OAuth 2.0 / 2.1**:
   - **Authorization URL:** `https://api.minna.uz/api/oauth/authorize`
   - **Token URL:** `https://api.minna.uz/api/oauth/token`
   - **Scope:** `read:profile read:courses read:progress read:tests`
   - **PKCE:** Enabled (`S256`)

---

## 5. Available Tools

### Tier 1: Public Read-Only Tools (No auth required)

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_courses` | None | List published courses (N5 to N1), descriptions, and modules. |
| `get_course_details` | `idOrSlug: string` | View syllabus, modules, and lessons roadmap. |
| `get_lesson_details` | `courseId: string, lessonId: string` | Lesson content (Kotoba, Bunpou, Kanji, Renshuu). Free lessons open to all; Pro lessons locked. |
| `get_vocabulary` | None | Vocabulary words with readings, furigana, romaji, and Uzbek translations. |
| `get_kanji_list` | None | Japanese Kanji characters with onyomi, kunyomi, and Uzbek meanings. |
| `search_learning_materials` | `query: string` | Global search across courses, lessons, vocab, kanji, and tests. |
| `translate_japanese_uzbek` | `text: string, direction: 'ja-uz' \| 'uz-ja'` | AI-powered Japanese-Uzbek translation (max 500 chars; rate-limited). |
| `get_available_tests` | `level?: string, category?: string` | List published JLPT tests and mock exams. |
| `get_test_details` | `slugOrId: string` | Test questions and sections (answers sanitized to prevent cheating). |

### Tier 2: Authenticated Read Tools (Requires valid user Bearer token)

| Tool Name | Parameters | Required Scope | Description |
| :--- | :--- | :--- | :--- |
| `get_my_profile` | None | `read:profile` | User profile, streak days, coin balance, and Pro status. |
| `get_my_subscription` | None | `read:profile` | Subscription tier, active plan name, and days remaining. |
| `get_my_learning_statistics` | None | `read:progress` | Personalized stats (study minutes, mastered vocab & kanji). |
| `get_my_study_plan` | None | `read:profile` | Configured daily study goals and target JLPT level. |
| `get_vocabulary_statistics` | None | `read:progress` | Flashcard status breakdown (mastered vs learning). |
| `get_kanji_statistics` | None | `read:progress` | Kanji flashcard statistics. |
| `get_test_history` | `limit?: number` | `read:tests` | History of completed JLPT tests with scores. |
| `get_test_results` | `resultId: string` | `read:tests` | Detailed test analysis, question reviews, and explanations. |

---

## 6. Available Resources & Prompts

### Resources
- `minnauz://platform/info`: Platform pedagogical model and subscription tiers.
- `minnauz://jlpt/guide`: Official JLPT scoring guide (IRT scaled scores, pass marks, and pedagogical kanji/vocab estimates).
- `minnauz://methodology/uzbek-japanese`: Uzbek-Japanese linguistic parallels (SOV word order, agglutinative particle correspondences).
- `minnauz://courses/catalog`: Live course catalog JSON.

### Prompts
- `japanese_sensei`: Bilingual Sensei tutor explaining grammar and vocabulary in Uzbek with furigana and Japanese examples.
- `jlpt_exam_tutor`: JLPT exam coach running realistic question drills per level and section.
- `grammar_breakdown`: Detailed pedagogical breakdown of specific Japanese grammar patterns.

---

## 7. Production Deployment & Reliability (`mcp.minna.uz`)

### PM2 Process Supervision
```bash
pm2 start dist/index.js --name "minnauz-mcp"
pm2 save
```

### Nginx Virtual Host
```nginx
server {
    listen 443 ssl http2;
    server_name mcp.minna.uz;

    ssl_certificate /etc/letsencrypt/live/mcp.minna.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.minna.uz/privkey.pem;

    # Critical: streamable HTTP requires unbuffered proxying
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding on;

    proxy_read_timeout 300s;
    proxy_send_timeout 300s;

    location /mcp {
        proxy_pass http://127.0.0.1:3002/mcp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /.well-known/oauth-protected-resource {
        proxy_pass http://127.0.0.1:3002/.well-known/oauth-protected-resource;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://127.0.0.1:3002/health;
        access_log off;
    }
}
```

---

## 8. License
Private and proprietary. Copyright © MinnaUz. All rights reserved.

