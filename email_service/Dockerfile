FROM node:20.16.0 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20.16.0-alpine3.20

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/.env ./
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production \
    AMQP_URI=amqp://root:randompassword@rabbitmq_container_dev:5672 \
    REDIS_URI=redis://yourpassword@redis_container_dev:6379 \
    SMTP_EMAIL= \
    SMTP_PASSWORD=

CMD ["npm", "run", "start:prod"]