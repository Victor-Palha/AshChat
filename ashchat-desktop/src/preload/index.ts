import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'
import { ChatPropsDTO } from 'main/persistence/DTO/ChatPropsDTO'
import { AddMessagePropsDTO } from 'main/persistence/DTO/AddMessagePropsDTO'
import { UpdateMessageStatusPropsDTO } from 'main/persistence/DTO/UpdateMessageStatusPropsDTO'
import { UpdateChatInformationDTO } from 'main/persistence/DTO/UpdateChatInformationDTO'
import { LabelChatPropsDTO } from 'main/persistence/DTO/LabelChatPropsDTO'

declare global {
  interface Window {
    electron: ElectronAPI
    chatApi: typeof chatApi
    messageApi: typeof messageApi
    labelApi: typeof labelApi
    utilsApi: typeof utilsApi
  }
}

// Custom APIs for renderer
const chatApi = {
  addChat: (chat: ChatPropsDTO) => ipcRenderer.invoke('addChat', chat),
  getChat: (chat_id: string) => ipcRenderer.invoke('getChat', chat_id),
  getAllChats: () => ipcRenderer.invoke('getAllChats'),
  updateChatInformationProfile: (payload: UpdateChatInformationDTO) => ipcRenderer.invoke('updateChatInformationProfile', payload),
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