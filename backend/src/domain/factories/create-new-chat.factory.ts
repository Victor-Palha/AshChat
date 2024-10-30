import { InMemoryChatRepository } from "../domain/repositories/in-memory/in-memory-chat-repository";
import { InMemoryUserRepository } from "../domain/repositories/in-memory/in-memory-user-repository";
import { CreateNewChatUseCase } from "../domain/use-cases/create-new-chat-use-case";

export function createNewChatFactory(){
    const chatRepository = new InMemoryChatRepository();
    const userRepository = new InMemoryUserRepository();
    const service = new CreateNewChatUseCase(chatRepository, userRepository);
    return service
}