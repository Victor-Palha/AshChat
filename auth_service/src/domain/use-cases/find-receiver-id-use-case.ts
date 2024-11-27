import { ChatRepository } from "../repositories/chat-repository";

type FindReceiverIdUseCaseDTO = {
    chatId: string;
    senderId: string;
}

export class FindReceiverIdUseCase{
    constructor(
        private chatRepository: ChatRepository
    ){}

    async execute({chatId, senderId}: FindReceiverIdUseCaseDTO): Promise<string | null>{
        return this.chatRepository.findReceiverId(chatId, senderId);
    }
}