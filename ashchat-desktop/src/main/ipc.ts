// src/main/ipcMainHandlers.ts
import { ipcMain } from 'electron';
import { PrismaChatRepository } from './persistence/prisma-chat-repository';
import { ChatPropsDTO } from './persistence/DTO/ChatPropsDTO';
import { UpdateChatInformationDTO } from './persistence/DTO/UpdateChatInformationDTO';
import { AddMessagePropsDTO } from './persistence/DTO/AddMessagePropsDTO';
import { UpdateMessageStatusPropsDTO } from './persistence/DTO/UpdateMessageStatusPropsDTO';

const prismaChats = new PrismaChatRepository();

// Funções IPC para manipulação de chats
export function setupChatHandlers() {
    ipcMain.handle('addChat', async (_, payload: ChatPropsDTO) => prismaChats.addChat(payload));
    ipcMain.handle('getChat', async (_, chat_id: string) => prismaChats.getChat(chat_id));
    ipcMain.handle('getAllChats', async () => prismaChats.getAllChats());
    ipcMain.handle('updateChatInformationProfile', async (_, payload: UpdateChatInformationDTO) => prismaChats.updateChatInformationProfile(payload));
}

// Funções IPC para manipulação de mensagens
export function setupMessageHandlers() {
    ipcMain.handle('addMessage', async (_, payload: AddMessagePropsDTO) => prismaChats.addMessage(payload));
    ipcMain.handle('updateMessageStatus', async (_, payload: UpdateMessageStatusPropsDTO) => prismaChats.updateMessageStatus(payload));
}

// Funções IPC para manipulação de labels
export function setupLabelHandlers() {
    ipcMain.handle('getLabels', async () => prismaChats.getLabels());
    ipcMain.handle('clearNotifications', async (_, chat_id: string) => prismaChats.clearNotifications(chat_id));
}

export function setupUtilsHandlers() {
    ipcMain.handle("getPlatform", async () => process.platform);
}

// Inicializa todos os handlers
export function setupIpcHandlers() {
    setupChatHandlers();
    setupMessageHandlers();
    setupLabelHandlers();
    setupUtilsHandlers();
}