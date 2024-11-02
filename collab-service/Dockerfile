FROM node:18-alpine

COPY . /app
WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm compile

CMD node .

