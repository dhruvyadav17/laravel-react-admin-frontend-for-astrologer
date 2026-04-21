# ─────────────────────────────────────────────────────────────────
#  Node Dockerfile for React frontend
#  Build context: ./frontend  (set in docker-compose)
#  Stages: dev | build
# ─────────────────────────────────────────────────────────────────

# ── DEV (Vite dev server with HMR) ────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

# Install deps first (cached layer)
COPY package*.json ./
RUN npm ci

# Source is volume-mounted in docker-compose — no COPY needed
EXPOSE 5173

# --host 0.0.0.0 makes Vite accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ── BUILD (production static files) ───────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .

# VITE_API_URL must be passed at build time: --build-arg VITE_API_URL=https://...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build
# Output → /app/dist — copied to host via volume or multi-stage
