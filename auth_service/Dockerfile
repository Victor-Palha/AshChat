FROM node:20.16.0 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20.16.0-alpine3.20

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/private_key.pem ./
COPY --from=build /usr/src/app/.env ./
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV NODE_ENV="production" \
    PORT=3005 \
    JWT_TEMPORARY_TOKEN="temporarysecret" \
    MONGODB_URI="mongodb://root:example@mongodb_container_dev:27017/auth?authSource=admin" \
    AMQP_URI="amqp://root:randompassword@rabbitmq_container_dev:5672" \
    JWT_REFRESH_TOKEN="refreshToken"

EXPOSE 3005

CMD ["npm", "run", "start:prod"]