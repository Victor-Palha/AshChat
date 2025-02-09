import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, electronAPI } from '@electron-toolkit/preload'
import { ChatPropsDTO } from 'main/persistence/DTO/ChatPropsDTO'
import { AddMessagePropsDTO } from 'main/persistence/DTO/AddMessagePropsDTO'
import { UpdateMessageStatusPropsDTO } from 'main/persistence/DTO/UpdateMessageStatusPropsDTO'
import { UpdateChatInformationDTO } from 'main/persistence/DTO/UpdateChatInformationDTO'

declare global {
  interface Window {
    electron: ElectronAPI
    chatApi: typeof chatApi
    messageApi: typeof messageApi
    labelApi: typeof labelApi
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
  getLabels: () => ipcRenderer.invoke('getLabels'),
  clearNotifications: (chat_id: string) => ipcRenderer.invoke('clearNotifications', chat_id),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('chatAPI', chatApi);
    contextBridge.exposeInMainWorld('messageAPI', messageApi);
    contextBridge.exposeInMainWorld('labelAPI', labelApi);

  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
