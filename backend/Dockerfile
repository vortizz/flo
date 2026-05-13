FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY packages/types/package*.json ./packages/types/

RUN npm install

COPY backend ./backend
COPY packages/types ./packages/types

WORKDIR /app/backend

# Development stage
FROM base AS development
RUN npx prisma generate
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production
RUN npx prisma generate
RUN npm run build
CMD ["node", "dist/src/main.js"]