import { app, shell, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import prompt from 'electron-prompt'
import fs from 'fs'

import icon from '../../resources/icon.png?asset'

function createWindow(): void {
    // ブラウザウィンドウを作成します。
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: false,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })
    createMenus(mainWindow)

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // electron-vite cliに基づくレンダラーのHMR。
    // 開発用のリモートURLまたは本番用のローカルHTMLファイルをロードします。
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// Electronが初期化を完了し、ブラウザウィンドウを作成する準備ができたときに呼び出されるメソッドです。
// 一部のAPIはこのイベントが発生した後にのみ使用できます。
app.whenReady().then(() => {
    // Windows用のアプリユーザーモデルIDを設定します。
    electronApp.setAppUserModelId('com.electron')

    // 開発中はF12でDevToolsを開閉し、本番環境ではCommandOrControl + Rを無視します。
    // 詳細は https://github.com/alex8088/electron-toolkit/tree/master/packages/utils を参照してください。
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPCテスト
    ipcMain.on('ping', () => console.log('pong'))

    ipcMain.handle('prompt', handleOpenPrompt)
    createWindow()

    app.on('activate', function () {
        // macOSでは、ドックアイコンがクリックされ、他にウィンドウが開いていない場合にウィンドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// すべてのウィンドウが閉じられたときに終了します。ただし、macOSでは、ユーザーがCmd + Qで明示的に終了するまで、アプリケーションとそのメニューバーがアクティブなままになるのが一般的です。
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// このファイルには、アプリの特定のメインプロセスコードを含めることができます。また、別のファイルに分けてここでrequireすることもできます。
const handleOpenPrompt = async () => {
    let result = ''

    await prompt({
        title: '郵便番号検索',
        label: '郵便番号を入力してください。',
        value: '9503122',
        type: 'input',
        inputAttrs: {
            type: 'text',
            required: 'true',
        }
    }).then(text => {
        result = text || ''
    }).catch(console.error)

    return result
}
const printPDF = (mainWindow: Electron.BrowserWindow, filename: string) => {
    console.log(mainWindow.webContents)
    mainWindow.webContents.printToPDF({
        pageSize: {
            width: 100*1000, height: 148*1000
        },
        printBackground: true
    }).then(res => {
        console.log(res)
        fs.writeFile(filename, res, (err) => {
            if (err) throw err
            console.log('write pdf successfuly.')
        })
    }).catch(err => {
        throw err
    })
}
const exportPDF = (mainWindow: Electron.BrowserWindow) => {
    dialog.showSaveDialog(mainWindow, {
        filters: [
            {name: 'PDF file', extensions: ['pdf']}
        ]
    }).then(res => {
        console.log(res)
        if (!res.canceled) {
            printPDF(mainWindow, res.filePath)
        }
    }).catch(err => {
        console.log(err)
    })
}

const createMenus = (mainWindow: Electron.BrowserWindow) => {
    const isMac = (process.platform == 'darwin')
    const menuTemplate = [
        ...(isMac? [{
            label:app.name,
            submenu: [
                {role: 'about', label: `${app.name}について`},
                {type: 'separator'},
                {role: 'quit', label: `${app.name}を終了`}
            ]
        }]: []), {
            label: 'ファイル',
            submenu: [
                {label: 'PDF書き出し', click: () => exportPDF(mainWindow)}
            ]
        },{
            label: '表示',
            submenu: [
                {role: 'reload', label: '再読み込み'},
                {role: 'forceReload', label: '強制的に再読み込み'},
                {role: 'toggleDevTools', label: '開発者ツールを表示'}
            ]
        }
    ] as MenuItemConstructorOptions[]
    const template = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(template)
}
