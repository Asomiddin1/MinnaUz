# MinnaUz 2.0 — Deployment & Infrastructure

This document outlines deployment configurations, process supervision, Docker containerization, reverse proxy setups, and database migration routines.

---

## 1. Deployment Overview

MinnaUz can be deployed either via Docker containers or as supervised Node.js processes behind an Nginx reverse proxy.

```text
Incoming HTTPS Traffic (:443)
            ↓
    Nginx Reverse Proxy / SSL (Certbot)
       ├── /api/* & /uploads/*  ──> NestJS Backend API (Port 3001)
       └── /*                   ──> Next.js Web Application (Port 3000)
```

---

## 2. Database Migrations Workflow

For production, `DATABASE_URL` should point to the private AWS RDS PostgreSQL
endpoint and include `sslmode=require`. Allow inbound TCP/5432 only from the
backend security group; do not expose RDS publicly.

Before starting or updating the backend service in production:

```bash
cd api
# Generate Prisma client bindings
npx prisma generate

# Apply pending migrations to production PostgreSQL database
npx prisma migrate deploy
```

The backend uses AWS S3 for uploaded avatars, images, videos, audio, PDFs, and
other files. Grant the backend IAM role (preferred) or IAM user only
`s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` permissions for the
configured bucket prefix. Keep the bucket private and use the API's signed
download endpoint for private assets.

---

## 3. Production Build & Execution

### Backend (`api/`):
```bash
cd api
npm install --frozen-lockfile
npm run build
# Start via PM2 or Node
pm2 start dist/main.js --name "minnauz-api"
```

### Frontend (`web/`):
```bash
cd web
npm install --frozen-lockfile
npm run build
pm2 start npm --name "minnauz-web" -- start
```

---

## 4. Nginx Configuration Template

```nginx
server {
    listen 80;
    server_name minna.uz www.minna.uz api.minna.uz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.minna.uz;

    ssl_certificate /etc/letsencrypt/live/minna.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/minna.uz/privkey.pem;

    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name minna.uz www.minna.uz;

    ssl_certificate /etc/letsencrypt/live/minna.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/minna.uz/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
