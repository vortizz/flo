FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/

RUN npm install

COPY apps/web ./apps/web
COPY packages/types ./packages/types

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]