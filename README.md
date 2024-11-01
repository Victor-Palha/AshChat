# AshChat
**AshChat** is a simple web application that allows users to chat with each other in real-time. The core functionality of the application is websockets, which allows for real-time communication between the server and the client. The application is built using __Node.js__ and __Express.js__ with __Socket.io__ for the websockets. The front-end is built using __React.js__ and __Radix UI__ for the design. The application is deployed on __Heroku__.
And since we are using the JavaScript stack, we are using **TypeScript** for the type checking and better code quality.

## Features
The application is based on the premise of a chat room wich allows users to join and chat with each other in real-time. The application has the following features:
- Users have a account
- Users can be friends with each other
- Users can chat with each other in real-time
- Users can see when their friends are online
- Users can see when their friends are typing
- Users can see when their friends are offline
- Create a chat group
- Add friends to a chat group
- Chat with friends in a chat group

### Main feature
Create a web application to chat with friends is a common feature in many applications. The **main feature** for this application is the user choice a language to chat with friends. The application will translate the messages to the selected language and send it to the friend. The friend will receive the message in the selected language and can reply in the same language. The application will translate the message back to the user language.

How i'm going to do this?
- I didn't decide yet, but i'm thinking about using the OpenAI API to translate the messages. I will need to study more about this API and see if it's possible to use it in this project.

## Technologies
The application is built using the following technologies:
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: A web application framework for Node.js.
- **Socket.io**: A library that enables real-time, bidirectional and event-based communication between the browser and the server.
- **React.js**: A JavaScript library for building user interfaces.
- **Radix UI**: A design system for building powerful React applications.
- **TypeScript**: A superset of JavaScript that adds static type definitions.
