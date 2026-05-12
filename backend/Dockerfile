FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY packages/types/package*.json ./packages/types/

RUN npm install

COPY backend ./backend
COPY packages/types ./packages/types

WORKDIR /app/backend

EXPOSE 4000

CMD ["npm", "run", "start:dev"]