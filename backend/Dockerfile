FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
