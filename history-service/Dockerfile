FROM node:18-alpine

WORKDIR /history-service

COPY package*.json ./
RUN npm install

COPY . /history-service

CMD ["npm", "start"]


