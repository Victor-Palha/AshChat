import { InMemoryChatRepository } from "../domain/repositories/in-memory/in-memory-chat-repository";
import { FindReceiverIdUseCase } from "../domain/use-cases/find-receiver-id-use-case";

export function findReceiverIdFactory(){
    const chatRepository = new InMemoryChatRepository();
    const service = new FindReceiverIdUseCase(chatRepository)
    return service
}