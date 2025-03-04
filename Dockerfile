FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/index.js .

CMD ["node", "./index.js"]
