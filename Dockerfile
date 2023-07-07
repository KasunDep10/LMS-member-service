FROM node:18-alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./dist ./dist
COPY ./.env .

RUN npm install -P

CMD node dist/main.js