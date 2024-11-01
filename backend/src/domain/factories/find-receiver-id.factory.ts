import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";
import { FindReceiverIdUseCase } from "../use-cases/find-receiver-id-use-case";

export function findReceiverIdFactory(){
    const chatRepository = new MongoChatRepository();
    const service = new FindReceiverIdUseCase(chatRepository)
    return service
}