import { Chat, Message, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ChatPropsDTO } from './DTO/ChatPropsDTO';
import { LabelChatPropsDTO } from './DTO/LabelChatPropsDTO';
import { MessagePropsDTO } from './DTO/MessagePropsDTO';
import { AddMessagePropsDTO } from './DTO/AddMessagePropsDTO';
import { UpdateMessageStatusPropsDTO } from './DTO/UpdateMessageStatusPropsDTO';
import { UpdateChatInformationDTO } from './DTO/UpdateChatInformationDTO';


const prisma = new PrismaClient();

export class PrismaChatRepository {

    public async addChat({ id, messages, nickname, profile_picture, description, preferred_language }: ChatPropsDTO): Promise<void> {
        const chatExists = await prisma.chat.findUnique({
            where: { id: id },
        });

        if (chatExists) {
            return;
        }

        await prisma.chat.create({
            data: {
                id,
                nickname,
                profile_picture,
                description,
                preferred_language,
                messages: {
                    create: messages || [],
                },
                labels: {
                    create: {
                        id: randomUUID(),
                        notifications: 0
                    },
                },
            },
        });
    }

    // Obtém todos os labels
    public async getLabels(): Promise<LabelChatPropsDTO[] | null> {
        // const labels = await prisma.chatLabel.findMany();
        const labels = await prisma.chatLabel.findMany({
            include: {
              chat: {
                select: {
                  nickname: true,
                  profile_picture: true,
                  messages: {
                    orderBy: {
                      timestamp: "desc"
                    },
                    take: 1
                  }
                }
              }
            }
        });

        const labelsJoinned = labels.map(label => ({
            chat_id: label.chat_id,
            nickname: label.chat.nickname || 'Unknown',
            last_message: label.chat.messages[0] ? {
                id: label.chat.messages[0].id,
                content: label.chat.messages[0].content,
                sender_id: label.chat.messages[0].sender_id,
                timestamp: label.chat.messages[0].timestamp,
                status: label.chat.messages[0].status,
            } : null,
            notification: label.notifications,
            last_interaction: label.chat.messages[0] ? label.chat.messages[0].timestamp || new Date() : null, 
            profile_picture: label.chat.profile_picture || 'https://default-profile-picture.com'
        }));

        return labelsJoinned;
    }

    // Obtém um chat específico
    public async getChat(chat_id: string): Promise<ChatPropsDTO | null> {
        const chat = await prisma.chat.findUnique({
            where: { id: chat_id },
            include: {
                messages: true,
            },
        });

        return chat;
    }

    public async getAllChats(): Promise<ChatPropsDTO[]> {
        const chats = await prisma.chat.findMany({
            include: {
                messages: true,
            },
        });
        return chats;
    }

    // Adiciona uma mensagem a um chat
    public async addMessage({ chat_id, content, sender_id, timestamp, isNotification = false }: AddMessagePropsDTO): Promise<MessagePropsDTO | undefined> {
        const chatExists = await prisma.chat.findUnique({
            where: { id: chat_id },
            include: { messages: true },
        });

        if (!chatExists) {
            if (isNotification) {
                await this.addNewChatThroughNotification({ chat_id, content, sender_id, timestamp });
            }
            return;
        }

        const newMessage = await prisma.message.create({
            data: {
                chat_id,
                content,
                sender_id,
                timestamp,
                status: 'PENDING',
            },
        });

        await this.updateLabel(chat_id, isNotification);

        return newMessage;
    }

    // Atualiza o status de uma mensagem
    public async updateMessageStatus({ id_message, status }: UpdateMessageStatusPropsDTO): Promise<void> {
        await prisma.message.update({
            where: { id: id_message },
            data: { status },
        });
    }

    // Limpa as notificações de um chat
    public async clearNotifications(chat_id: string): Promise<void> {
        await prisma.chatLabel.updateMany({
            where: { chat_id },
            data: { notifications: 0 },
        });
    }

    // Atualiza as informações do perfil do chat
    public async updateChatInformationProfile({ nickname, photo_url, description, chat_id }: UpdateChatInformationDTO): Promise<void> {
        await prisma.chat.update({
            where: { id: chat_id },
            data: {
                nickname,
                profile_picture: photo_url,
                description,
            },
        });

        await this.updateNicknameAndProfilePictureForLabel(chat_id, nickname, photo_url);
    }

    // Métodos auxiliares
    private async updateLabel(chat_id: string, isNotification: boolean): Promise<void> {
        await prisma.chatLabel.updateMany({
            where: { chat_id },
            data: {
                notifications: isNotification ? { increment: 1 } : 0
            },
        });
    }

    private async addNewChatThroughNotification({ chat_id, content, sender_id, timestamp }: AddMessagePropsDTO): Promise<void> {
        await prisma.chat.create({
            data: {
                id: chat_id,
                nickname: "Unknown",
                profile_picture: "http://localhost:3006/files/default.jpg",
                description: '',
                preferred_language: '',
                messages: {
                    create: {
                        id: randomUUID(),
                        content,
                        sender_id,
                        timestamp,
                        status: 'SENT',
                    },
                },
                labels: {
                    create: {
                        id: randomUUID(),
                        notifications: 1
                    },
                },
            },
        });
    }

    private async updateNicknameAndProfilePictureForLabel(chat_id: string, nickname: string, profile_picture: string): Promise<void> {
        await prisma.chat.updateMany({
            where: { id: chat_id },
            data: {
                nickname,
                profile_picture: `${profile_picture}`,
            },
        });
    }

    public async backupMessages(chats: BackupMessagesDTO[]): Promise<void> {
        try {
            for (const chatData of chats) {
                await prisma.chat.create({
                    data: {
                        id: chatData.id,
                        nickname: chatData.receiver.nickname,
                        description: chatData.receiver.description,
                        profile_picture: chatData.receiver.photo_url,
                        preferred_language: chatData.receiver.preferred_language,
                    },
                });
    
                await prisma.chatLabel.create({
                    data: {
                        chat_id: chatData.id,
                        notifications: 0,
                    },
                });

                for (const messageData of chatData.messages) {
                    await prisma.message.create({
                        data: {
                            id: messageData.id,
                            chat_id: chatData.id,
                            content: messageData.content,
                            sender_id: messageData.sender_id,
                            status: messageData.status,
                            timestamp: new Date(messageData.timestamp),
                        },
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao salvar backup das mensagens:", error);
            throw error;
        }
    }

    public async deleteAll(){
        await prisma.message.deleteMany()
        await prisma.chatLabel.deleteMany()
        await prisma.chat.deleteMany()
    }
}