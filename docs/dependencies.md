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

The MongoDB models are defined using Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js. For example, the chat model is defined in `chat.model.ts`:

```ts
import mongoose, { Document, Schema } from "mongoose";

const chatSchema = new Schema({
    usersID: { type: [String], required: true },
    messages: [messageSchema],
    sameLanguage: {type: Boolean, default: false}
}, { timestamps: true });

export const ChatModel = mongoose.model("Chat", chatSchema);
```

## RabbitMQ

RabbitMQ is a message broker used for handling asynchronous communication between different parts of the application, such as sending email verification codes.

### Configuration

The RabbitMQ connection URI is specified in the `.env.example` file:

```env
AMQP_URI="amqp://root:randompassword@localhost:5672"
```

### Usage

RabbitMQ is used in the email verification service to send and receive messages. The configuration and usage details can be found in the `email-verification-service` or in the `backend` directory.

## Redis

Redis is an in-memory data structure store used as a cache and message broker. It is used in the email verification service to store temporary data such as verification codes.

### Configuration

The Redis connection URI is specified in the `.env.example` files:

```env
REDIS_URI="redis://:yourpassword@localhost:6379"
```

### Usage

Redis is used in the email verification service to store and retrieve data. The configuration and usage details can be found in the `email-verification-service` directory.

## Email Service

The email service is responsible for sending email verification codes to users. It uses Nodemailer to send emails via an SMTP server.

### Configuration

The SMTP server configuration is specified in the `.env.example` file:

```env
SMTP_EMAIL="your-email@example.com"
SMTP_PASSWORD="your-email-password"
```

### Usage

The email service is implemented in the `email-verification-service/src/config/mailer/mailer.ts` file. It uses Nodemailer to send emails:

```ts
export class MailerService {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor({ host, port, secure, user, pass }: MailerServiceInitialize) {
        this.transporter = createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });
    }

    public async sendMailToRegister({ to, code, who }: SendMailerRequest): Promise<void> {
        const mailOptions = {
            from: `"AshChat Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Código de Verificação de Conta - AshChat",
            text: `Olá ${who},\n\nSeu código de verificação para o AshChat é: ${code}\n\nEste código expira em 10 minutos.\n\nObrigado por se registrar!\nEquipe AshChat`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Olá ${who},</h2>
                    <p>Seu código de verificação para o AshChat é:</p>
                    <h1 style="color: #6320EE;">${code}</h1>
                    <p>Este código expira em 10 minutos.</p>
                    <p>Obrigado por se registrar!</p>
                    <br>
                    <p><strong>Equipe AshChat</strong></p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`E-mail enviado para ${to} com o código de verificação.`);
        } catch (error) {
            console.error("Erro ao enviar o e-mail de verificação:", error);
            throw new FailToSendEmailError();
        }
    }
}
```

## Other Dependencies

### Express

Express is a web application framework for Node.js, used to build the backend API.

### Socket.io

Socket.io is used for real-time communication between the server and the client.

### Zod

Zod is a TypeScript-first schema declaration and validation library.

### bcryptjs

bcryptjs is used for hashing passwords.

### jsonwebtoken

jsonwebtoken is used for generating and verifying JSON Web Tokens (JWTs).

### cors

cors is used to enable Cross-Origin Resource Sharing (CORS) in the Express application.

## Development Dependencies

### TypeScript

TypeScript is used for type checking and better code quality.

### ts-node-dev

ts-node-dev is used for running TypeScript files with hot-reloading during development.

### Vitest

Vitest is used for unit testing.

### @types/*

Type definitions for various libraries used in the project.

For a complete list of dependencies, refer to the `package.json` files in the backend and email-verification-service directories.

