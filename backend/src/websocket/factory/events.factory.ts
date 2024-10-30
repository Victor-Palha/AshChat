import { Socket } from "socket.io";
import { IOServer } from "..";
import { createChatEvent } from "../events/create-chat.event";
import { joinChatEvent } from "../events/join-chat.event";
import { sendMessageEvent } from "../events/send-message.event";
import { closeChatEvent } from "../events/close-chat.event";

export function Events(socket: Socket, INSTANCE_IO: IOServer){
    createChatEvent(socket, INSTANCE_IO);
    joinChatEvent(socket, INSTANCE_IO);
    sendMessageEvent(socket, INSTANCE_IO);
    closeChatEvent(socket, INSTANCE_IO)
}