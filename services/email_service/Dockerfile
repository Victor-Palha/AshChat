FROM node:20.16.0 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20.16.0-alpine3.20

WORKDIR /usr/src
COPY --from=build /usr/src/app/.env ./
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV NODE_ENV="production" 
ENV SMTP_EMAIL=${SMTP_EMAIL}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
ENV REDIS_URI=${REDIS_URI}
ENV AMQP_URI=${AMQP_URI}

CMD ["npm", "run", "start:prod"]