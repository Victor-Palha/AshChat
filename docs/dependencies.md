# Dependencies

The AshChat application relies on several key dependencies to function correctly. This document provides an overview of these dependencies and their roles within the application.

## MongoDB

MongoDB is a NoSQL database used to store chat data, user information, and other application-related data. It is chosen for its flexibility and scalability.

### Configuration

The MongoDB connection URI is specified in the `.env.example` file:

```env
MONGODB_URI="mongodb://root:example@localhost:27017"
```

### Usage

The MongoDB models are defined using Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js for the auth service. The models are defined in the `auth_service/src/models` directory.
And are used in Char Service with **MongoDB Drive** for Elixir. The `chat_service/lib/chat_service/models` directory contains the models for the chat service.

## RabbitMQ

RabbitMQ is a message broker used for handling asynchronous communication between different parts of the application, such as sending email verification codes and processing chat messages.

### Configuration

The RabbitMQ connection URI is specified in the `.env.example` file:

```env
AMQP_URI="amqp://root:randompassword@localhost:5672"
```

### Usage

RabbitMQ is used in the email verification service to send and receive messages. The configuration and usage details can be found in any of the services that use RabbitMQ they all have some dedicated code to handle the communication. Python, Node.js, and Elixir services use RabbitMQ for communication and each has its own way of handling messages through libraries like `pika`, `amqplib`, and `amqp`.

## Redis

Redis is an in-memory data structure store used as a cache and message broker. It is used in the email verification service to store temporary data such as verification codes.

### Configuration

The Redis connection URI is specified in the `.env.example` files:

```env
REDIS_URI="redis://:yourpassword@localhost:6379"
```

### Usage

Redis is used in the email service to store and retrieve data. The configuration and usage details can be found in the `email-service` directory.