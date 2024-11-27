import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";
import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { CreateNewChatUseCase } from "../use-cases/create-new-chat-use-case";

export function createNewChatFactory(){
    const chatRepository = new MongoChatRepository();
    const userRepository = new MongoUserRepository();
    const service = new CreateNewChatUseCase(chatRepository, userRepository);
    return service
}