# Builds the React frontend and serves it alongside Nginx reverse proxy for Laravel

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --production=false

# Inject build-time env
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY frontend/ .
RUN npm run build

# ── Final Nginx image ─────────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy built React app
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy nginx config (mounted at runtime, but provide default)
COPY docker/nginx/spa.conf /etc/nginx/conf.d/spa.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
