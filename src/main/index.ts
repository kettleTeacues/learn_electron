import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { SqlClient } from './sqlite'

function createWindow(): void {
    // ブラウザウィンドウを作成します。
    // book: 62
    const mainWindow = new BrowserWindow({
        // width: 900,
        // height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            // book: 63
            preload: path.join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // electron-vite cliに基づくレンダラーのHMR。
    // 開発用のリモートURLまたは本番用のローカルHTMLファイルをロードします。
    // book: 63
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
}

// このメソッドは、Electronが初期化を完了し、ブラウザウィンドウを作成する準備ができたときに呼び出されます。
// 一部のAPIはこのイベントが発生した後でのみ使用できます。
// book: 63
app.whenReady().then(() => {
    // Windows用のアプリユーザーモデルIDを設定
    electronApp.setAppUserModelId('com.electron')

    // 開発中はF12でDevToolsをデフォルトで開閉し、
    // 本番環境ではCommandOrControl + Rを無視します。
    // 詳細は https://github.com/alex8088/electron-toolkit/tree/master/packages/utils を参照してください。
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPCテスト
    ipcMain.on('ping', () => console.log('pong'))

    createWindow() // book: 63

    app.on('activate', function () {
        // macOSでは、ドックアイコンがクリックされ、他にウィンドウが開いていない場合に
        // ウィンドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// すべてのウィンドウが閉じられたときに終了します。ただし、macOSでは、
// ユーザーがCmd + Qで明示的に終了するまで、アプリケーションとそのメニューバーがアクティブなままになるのが一般的です。
// book: 63
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// このファイルには、アプリの特定のメインプロセスコードの残りを含めることができます。
// また、それらを別のファイルに分けて、ここでrequireすることもできます。
const execute = (sqlClient: SqlClient, sql, param) => {
    console.log(sql, param)
    if (sql == 'create') {
        return Promise.resolve().then(() => {
            sqlClient.run(
                `CREATE TABLE IF NOT EXISTS todoTable(
                 id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT)`
            )
        })
    } else if (sql == 'insert') {
        return Promise.resolve().then(() => {
            sqlClient.run(
                `INSERT INTO todoTable (todo) VALUES (?)`,
                param
            )
        })
    } else if (sql == 'select') {
        return Promise.resolve().then(() => {
            return sqlClient.all(`SELECT * FROM todoTable`)
        })
    }
    return sql
}

ipcMain.handle('execSql', async (e, sql, param) => {
    const sqlClient = new SqlClient('./todo.db')
    return await execute(sqlClient, sql, param)
})
