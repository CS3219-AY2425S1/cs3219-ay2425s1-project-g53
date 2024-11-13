FROM node:18-alpine

WORKDIR /user-service

RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . /user-service

CMD ["pnpm", "start"]


