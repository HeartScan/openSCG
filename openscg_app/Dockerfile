# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# In staging context, we are at the root of openscg_app
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source and public folder
COPY . .

# Build Next.js with NO_REDIS flag to avoid connection errors during static generation
ENV NO_REDIS="true"
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Next.js 15 listens on 3000 by default, Cloud Run provides PORT.
# We set HOSTNAME to ensure it listens externally.
ENV HOSTNAME="0.0.0.0"

# Copy build artifacts and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/next.config.ts ./
# We need node_modules for server.js to run (socket.io etc)
# Using production-only install in runner to minimize image size
RUN npm install --omit=dev

EXPOSE 3000

# Using node server.js because it's our custom socket.io server
CMD ["node", "server.js"]
