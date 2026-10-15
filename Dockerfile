# Multi-stage Dockerfile for ConfigHub SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production assets to /app/dist
RUN npm run build

# Stage 2: Serve with lightweight NGINX
FROM nginx:alpine

# Copy custom nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
