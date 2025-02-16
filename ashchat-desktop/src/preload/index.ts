import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'
import { ChatPropsDTO } from 'main/persistence/DTO/ChatPropsDTO'
import { AddMessagePropsDTO } from 'main/persistence/DTO/AddMessagePropsDTO'
import { UpdateMessageStatusPropsDTO } from 'main/persistence/DTO/UpdateMessageStatusPropsDTO'
import { UpdateChatInformationDTO } from 'main/persistence/DTO/UpdateChatInformationDTO'
import { LabelChatPropsDTO } from 'main/persistence/DTO/LabelChatPropsDTO'
import { UserProfilePropsDTO } from 'main/persistence/DTO/UserProfilePropsDTO'
import { User } from '@prisma/client'
import { MessagePropsDTO } from 'main/persistence/DTO/MessagePropsDTO'

declare global {
  interface Window {
    electron: ElectronAPI
    chatApi: typeof chatApi
    messageApi: typeof messageApi
    labelApi: typeof labelApi
    utilsApi: typeof utilsApi
    userApi: typeof userApi
  }
}

// Custom APIs for renderer
const chatApi = {
  addChat: (chat: ChatPropsDTO) => ipcRenderer.invoke('addChat', chat),
  getChat: (chat_id: string): Promise<ChatPropsDTO | null> => ipcRenderer.invoke('getChat', chat_id),
  getAllChats: () => ipcRenderer.invoke('getAllChats'),
  updateChatInformationProfile: (payload: UpdateChatInformationDTO) => ipcRenderer.invoke('updateChatInformationProfile', payload),
  addMessage: (payload: AddMessagePropsDTO): Promise<MessagePropsDTO> => ipcRenderer.invoke('addMessage', payload),
  onNewMessage: (callback: (newMessage: MessagePropsDTO) => void) => {
    ipcRenderer.on('new-message', (_, newMessage: MessagePropsDTO) => {
      callback(newMessage);
    });
  },
}

const messageApi = {
  addMessage: (payload: AddMessagePropsDTO) => ipcRenderer.invoke('addMessage', payload),
  updateMessageStatus: (payload: UpdateMessageStatusPropsDTO) => ipcRenderer.invoke('updateMessageStatus', payload),
}

const labelApi = {
  getLabels: (): Promise<LabelChatPropsDTO[] | null> => ipcRenderer.invoke('getLabels'),
  clearNotifications: (chat_id: string) => ipcRenderer.invoke('clearNotifications', chat_id),
}

const utilsApi = {
  getPlataform: () => ipcRenderer.invoke('getPlatform'),
}

const userApi = {
  addUser: (payload: UserProfilePropsDTO) => ipcRenderer.invoke('addUser', payload),
  updateUser: (payload: UserProfilePropsDTO) => ipcRenderer.invoke('updateUser', payload),
  getUser: (): Promise<User | null> => ipcRenderer.invoke('getUser'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('chatApi', chatApi);
    contextBridge.exposeInMainWorld('messageApi', messageApi);
    contextBridge.exposeInMainWorld('labelApi', labelApi);
    contextBridge.exposeInMainWorld('utilsApi', utilsApi);
    contextBridge.exposeInMainWorld('userApi', userApi);
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  window.chatApi = chatApi;
  window.messageApi = messageApi;
  window.labelApi = labelApi;
  window.utilsApi = utilsApi;
}