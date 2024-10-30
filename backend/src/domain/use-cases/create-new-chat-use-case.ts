import { Chat } from "../entities/chat"
import { Message, MessageStatus } from "../entities/message"
import { ChatRepository } from "../repositories/chat-repository"
import { UserRepository } from "../repositories/user-repository"
import { ChatAlreadyExistsError } from "./errors/chat-already-exists-error"
import { UserNotFoundError } from "./errors/user-not-found-error"

export interface CreateNewChatUseCaseDTO {
    senderId: string
    receiverId: string
    content: string
}

type CreateNewChatUseCaseResponse = {
    chat: Chat
}

export class CreateNewChatUseCase {
    constructor(
        private chatRepository: ChatRepository,
        private userRepository: UserRepository
    ){}

    async execute({senderId, receiverId, content}: CreateNewChatUseCaseDTO): Promise<CreateNewChatUseCaseResponse>{
        const senderExists = await this.userRepository.findUserById(senderId)
        const receiverExists = await this.userRepository.findUserById(receiverId)

        if(!senderExists || !receiverExists){
            throw new UserNotFoundError()
        }

        const chatAlreadyExists = senderExists.contactsID.includes(receiverId) || receiverExists.chatsID.includes(senderId)

        if(chatAlreadyExists){
            throw new ChatAlreadyExistsError()
        }

        const fromContentToMessage: Message = new Message({
            content: content,
            senderId: senderId,
            status: MessageStatus.SENT,
            timestamp: new Date().toISOString(),
            translatedContent: ''
        })

        const bothSpeekSameLanguage = senderExists.preferredLanguage === receiverExists.preferredLanguage

        const chat = await this.chatRepository.createChat({
            senderId,
            receiverId,
            content,
            message: fromContentToMessage,
            sameLanguage: bothSpeekSameLanguage
        })

        await this.userRepository.addChatToUser(senderId, chat.id.getValue)
        await this.userRepository.addContactToUser(senderId, receiverId)
        
        await this.userRepository.addChatToUser(receiverId, chat.id.getValue)
        await this.userRepository.addContactToUser(receiverId, senderId)

        return {chat}
    }
}