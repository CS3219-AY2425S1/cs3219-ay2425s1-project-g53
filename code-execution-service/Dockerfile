FROM node:18-alpine

WORKDIR /code-execution-service

COPY package*.json ./
RUN npm install

COPY . /code-execution-service

CMD ["npm", "start"]
