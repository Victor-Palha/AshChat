import { InMemoryChatRepository } from "../domain/repositories/in-memory/in-memory-chat-repository";
import { SendMessageUseCase } from "../domain/use-cases/send-message-use-case";

export function sendNewMessageFactory(){
    const chatRepository = new InMemoryChatRepository();
    const service = new SendMessageUseCase(chatRepository);
    return service
}