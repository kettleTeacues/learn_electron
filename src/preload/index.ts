import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// レンダラー用のカスタムAPI
const api = {
    execSql: (sql, param) => ipcRenderer.invoke('execSql', sql, param)
}

// コンテキスト分離が有効な場合にのみ、`contextBridge` APIを使用して
// Electron APIをレンダラーに公開し、それ以外の場合は
// DOMグローバルに追加します。
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('electronApi', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (dtsで定義)
    window.electron = electronAPI
    // @ts-ignore (dtsで定義)
    window.api = api
}
