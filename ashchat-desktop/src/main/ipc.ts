// src/main/ipcMainHandlers.ts
import { ipcMain } from 'electron';
import { PrismaChatRepository } from './persistence/prisma-chat-repository';
import { ChatPropsDTO } from './persistence/DTO/ChatPropsDTO';
import { UpdateChatInformationDTO } from './persistence/DTO/UpdateChatInformationDTO';
import { AddMessagePropsDTO } from './persistence/DTO/AddMessagePropsDTO';
import { UpdateMessageStatusPropsDTO } from './persistence/DTO/UpdateMessageStatusPropsDTO';
import { PrismaUserRepository } from './persistence/prisma-user-repository';
import { UserProfilePropsDTO } from './persistence/DTO/UserProfilePropsDTO';
import { MessagePropsDTO } from './persistence/DTO/MessagePropsDTO';

const prismaChats = new PrismaChatRepository();
const prismaUsers = new PrismaUserRepository();

ipcMain.handle('addChat', async (_, payload: ChatPropsDTO) => prismaChats.addChat(payload));
ipcMain.handle('getChat', async (_, chat_id: string): Promise<ChatPropsDTO | null> => prismaChats.getChat(chat_id));
ipcMain.handle('getAllChats', async () => prismaChats.getAllChats());
ipcMain.handle('updateChatInformationProfile', async (_, payload: UpdateChatInformationDTO) => prismaChats.updateChatInformationProfile(payload));


ipcMain.handle('addMessage', async (_, payload: AddMessagePropsDTO): Promise<MessagePropsDTO | undefined> => prismaChats.addMessage(payload));
ipcMain.handle('updateMessageStatus', async (_, payload: UpdateMessageStatusPropsDTO) => prismaChats.updateMessageStatus(payload));



ipcMain.handle('getLabels', async (_) => prismaChats.getLabels());
ipcMain.handle('clearNotifications', async (_, chat_id: string) => prismaChats.clearNotifications(chat_id));



ipcMain.handle("getPlatform", async (_) => process.platform);

ipcMain.handle("addUser", async (_, payload: UserProfilePropsDTO) => prismaUsers.addUser(payload));
ipcMain.handle("updateUser", async (_, payload: UserProfilePropsDTO) => prismaUsers.updateUser(payload));
ipcMain.handle("getUser", async (_) => prismaUsers.getUser());