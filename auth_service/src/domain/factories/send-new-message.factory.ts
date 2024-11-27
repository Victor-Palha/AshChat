import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";
import { SendMessageUseCase } from "../use-cases/send-message-use-case";

export function sendNewMessageFactory(){
    const chatRepository = new MongoChatRepository();
    const service = new SendMessageUseCase(chatRepository);
    return service
}