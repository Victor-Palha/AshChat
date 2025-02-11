// src/main/ipcMainHandlers.ts
import { ipcMain } from 'electron';
import { PrismaChatRepository } from './persistence/prisma-chat-repository';
import { ChatPropsDTO } from './persistence/DTO/ChatPropsDTO';
import { UpdateChatInformationDTO } from './persistence/DTO/UpdateChatInformationDTO';
import { AddMessagePropsDTO } from './persistence/DTO/AddMessagePropsDTO';
import { UpdateMessageStatusPropsDTO } from './persistence/DTO/UpdateMessageStatusPropsDTO';

const prismaChats = new PrismaChatRepository();

ipcMain.handle('addChat', async (_, payload: ChatPropsDTO) => prismaChats.addChat(payload));
ipcMain.handle('getChat', async (_, chat_id: string) => prismaChats.getChat(chat_id));
ipcMain.handle('getAllChats', async () => prismaChats.getAllChats());
ipcMain.handle('updateChatInformationProfile', async (_, payload: UpdateChatInformationDTO) => prismaChats.updateChatInformationProfile(payload));


ipcMain.handle('addMessage', async (_, payload: AddMessagePropsDTO) => prismaChats.addMessage(payload));
ipcMain.handle('updateMessageStatus', async (_, payload: UpdateMessageStatusPropsDTO) => prismaChats.updateMessageStatus(payload));



ipcMain.handle('getLabels', async (_) => prismaChats.getLabels());
ipcMain.handle('clearNotifications', async (_, chat_id: string) => prismaChats.clearNotifications(chat_id));



ipcMain.handle("getPlatform", async (_) => process.platform);
