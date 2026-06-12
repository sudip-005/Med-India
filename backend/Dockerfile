# Use stable Node LTS base image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Build production bundle
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package files and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "dist/server.js"]
