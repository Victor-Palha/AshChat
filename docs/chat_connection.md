# Chat Connection

## Overview
The chat service is made with Elixir and the Phoenix Framework. The communication of messages between users is done in real-time using WebSockets and Channels in Phoenix. To connect to the chat service, the client must establish a WebSocket connection to the server.

## WebSocket Connection
The chat service uses WebSockets to establish a persistent connection between the client and the server. This connection allows for real-time communication between users in chat rooms. The client can send and receive messages over the WebSocket connection, enabling instant messaging functionality.

### Connection URL
The WebSocket connection URL for the chat service is `ws://localhost:4000/socket/`. The client must connect to this URL to establish a WebSocket connection with the server.

### Connection Process
To connect to the chat service, the client must send some information to the server. The client must send a `connect` message to the server with the following information:
- `token` - The user's authentication jwt token.
- `device_unique_id` - The unique id of the device that the user is connecting from.
- `preferred_language` - The preferred language of the user.

After sending the `connect` message, the client can connect to the channels and start sending and receiving messages.
#### Chat Channel
To connect to the chat channel, the client must send a `join` message to the server with the following information:
- `chat:room_id` - The id of the chat room that the user wants to join.
    - Example: `chat:1`
After sending the `join` message, the client can start sending and receiving messages in the chat room.
##### Sending Messages
To send a message in the chat room, the client must send a `message` message to the server channel with the `send_message` event and the following information:
- `content` - The content of the message.
- `mobile_ref_id` - The unique id of the message in the client side.

After sending the `message` message, the client will receive a confirmation that the message was sent successfully with the `message_sent` event. This confirmation will come from `message_sent` event with the following informations:
- `mobile_ref_id` - The unique id of the message in the client side.
- `status` - The status of the message.
    - `sent` - The message was sent successfully.
    - `error` - There was an error sending the message.
- `chat_id` - The id of the chat room that the message was sent to.

##### Receiving Messages
To receive messages in the chat room, the client will receive a `receive_message` event from the server channel with the following information:
- `chat_id` - The id of the chat room that the message was sent to.
- `content` - The content of the message.
- `sender_id` - The id of the user that sent the message.

#### Notification Channel
To connect to the notification channel, the client must join the `notification:*` channel. This channel is used to receive notifications about new messages in chat rooms that the user is participating in.
Every time a new message is sent in a chat room that the user is participating in, the client will receive a `new_notification` event from the server channel if the user is not in the chat room. This event will contain the following information:
- `chat_id` - The id of the chat room that the message was sent to.
- `sender_id` - The id of the user that sent the message.
- `content` - The content of the message.
- `timestamp` - The timestamp of the message.

##### Pending Notifications
If the user is not connected to the chat service when a new message is sent, the server will store the notification in the database and send it to the user when they connect to the chat service. This ensures that the user does not miss any messages while they are offline.
The pending notifications come from the `pending_notifications` event with the following information:
- `chat_id` - The id of the chat room that the message was sent to.
- `sender_id` - The id of the user that sent the message.
- `content` - The content of the message.
- `timestamp` - The timestamp of the message.

## Connection Example using JavaScript
The following example demonstrates how to connect to the chat service using JavaScript and the `phoenix` library.

```javascript
import { Socket } from "phoenix";
import WS from "ws";

const jwt_token = "eyJhbGciOiJSUzI1NiwsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiTUFJTiIsdmlhdCI6MTcfMzAyMzc3OCwiZXhwIjoxNzMzNjI4NTc4LCJzdWIiOir2NzRiZDgwNzA1ZWNjMTA5ZmQ0NDZkYTQifQ.ZdIdvJsLdCpd1SCUxXdnswEcTlHhVSUoZ7g4h7HoK8Smv1UAoiRhERnMmCGcEqTFUFCn5M4hMhGd4z-3selRAmtWng8sLDbQNdj4xssXoQT4DdRK5rpYj6ZAKz-DWVhnei1rIL-1gf9bZ36QOLJYQOBtlxxpS7QLiz7M1uFCvc2QcLMoIJjLWzsVhmAmjkj3t9FwSC-CtJmLWZycJzmxGaK0mRGkfZcHwJo8oSciTY36As_-RdDjpYxmmGU63SeDFkrbEr1yGboKc46WmrYaUsAYoeStLUmjwbPmtFpejzSd4z8oqfL73mjfkFSGaSLoPXNg3e6lfCCn8396CLR5Mw"
const device_unique_id = "somerandontoken";

// Configuration of the WebSocket connection
const socket = new Socket('ws://localhost:4000/socket', {
  params: { 
    token: jwt_token,
    device_unique_id: device_unique_id,
    preferred_language: "EN"
  },
  transport: WS,
});

socket.connect();

// Canal de chat e ID do chat
const chatID = "674bd8ba5a0b920001bd9f5d";
const channel = socket.channel(`chat:${chatID}`, {});

channel.join(5000)
  .receive("ok", resp => {
    console.log("Joined successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  })
  .receive("timeout", () => {
    console.log("Networking issue. Still waiting...");
  })

// send message to the chat
function sendMessage(content: string, mobile_ref_id: string){
  channel.push("send_message", { content, mobile_ref_id });
};

sendMessage("Hey, i'm fine! and you?", "123124");

// confirmations of messages sent
channel.on("message_sent", (payload) => {
  console.log("Got message", payload);

});

// receive messages
channel.on("receive_message", (payload) => {
  console.log("New message received", payload);
});

// Notification Channel
const notificationID = "6745e201c337080846beba9a";
const notificationChannel = socket.channel(`notifications:${notificationID}`, {});

// Join the notification channel
notificationChannel.join()
  .receive("ok", resp => {
    console.log("Joined successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

// Receive new notifications
notificationChannel.on("new_notification", (payload) => {
    console.log("New notification received:", payload);
});

// Receive pending notifications
notificationChannel.on("pending_notification", (payload) => {
    console.log("Pending notification received:", payload);
})
```