# electron

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

# 作業履歴
- [vite + electron-builderが使いやすい | zenn](https://zenn.dev/hikaelis/articles/b0e68ec5f7a30e)
```sh
npm create @quick-start/electron
    ✔ Project name: … electron
    ✔ Select a framework: › react
    ✔ Add TypeScript? … Yes
    ✔ Add Electron updater plugin? … No
    ✔ Enable Electron download mirror proxy? … No
```
ほか`ESLint`, `Prettier`などの非必須要素を削除。(file, package.json)

- [Electron | zenn](https://zenn.dev/link/comments/ff8b319fce45a7)
不足しているlinuxライブラリをインストール
```sh
sudo apt install -y libglib2.0-dev libdbus-glib-1-dev libatk1.0-dev libatk-bridge2.0-dev libcups2-dev libdrm-dev libgtk-3-dev libasound2-dev
```

- 開発環境を確認
```sh
yarn start
```

# WSL: Ubuntuで日本語の文字化け解消
VSCodeは問題なし。
electronウィンドウを立ち上げて、その中に表示される日本語がすべて□で表示される。
electronウィンドウでF12 -> consoleでも同様。

```sh
sudo apt install -y fonts-droid-fallback
```
どうやらフォントの問題の様子。
参考: [最新のLinux版のAtomやElectronの日本語表示が豆腐になる](https://qiita.com/kjunichi/items/4bb9a4ec879f85865307)

# electronのウィンドウで画像が表示されない問題を解消
次のエラーが発生した。
```log
Refused to load the image 'https://...' because it violates the following Content Security Policy directive: "img-src 'self' data:".
```

- `./src/renderer/index.html`の`<meta />`タグを編集する。
```diff
- content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
+ content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src *;"
```
- `img-src *;`とした。
- やったことは「コンテンツセキュリティポリシー(CSP)の設定を変更した」という感じ。
様々なリソースをどこから取得できるかを変更したというイメージで、今回は画像の取得元をすべて(`*`)とした。
- 参考
    - [コンテンツセキュリティポリシー (CSP)](https://developer.mozilla.org/ja/docs/Web/HTTP/CSP#%E4%BE%8B_3)

# viteプロジェクトにおける環境変数の扱い
- `VITE_`から始まる環境変数名を指定する。
- 自動でプロジェクトルートの`.env`ファイルを読み込む、`dotenv`は不要。
- `import.meta.env.['環境変数名']`で取得する。
```sh
# .env
VITE_ENV_VAR=XXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXX
```

```ts
// example: src/renderer/src/App.tsx
const envVar = import.meta.env.['VITE_ENV_VAR']
```

# electron-builderのエラーを解消する。
`npm create @quick-start/electron`でプロジェクトを作成したとき、`package.json`にあるビルド系のスクリプトは以下の通り。
```json
"scripts": {
    "build:unpack": "npm run build && electron-builder --dir",
    "build:win": "electron-vite build && electron-builder --win",
    "build:mac": "electron-vite build && electron-builder --mac",
    "build:linux": "electron-vite build && electron-builder --linux"
}
```

このとき`electron-vite build`は問題ないが、`electron-builder --<platform>`の命令で次のエラーが出る。
```log
$ yarn electron-vite build
    ⨯ Application entry file "build/electron.js" in the "~/projects/electron/dist/linux-unpacked/resources/app.asar" does not exist. Seems like a wrong configuration. failedTask=build stackTrace=Error: Application entry file "build/electron.js" in the "/home/kettle/projects/electron/dist/linux-unpacked/resources/app.asar" does not exist. 
```

これはelectronプロジェクトをビルドするときに以下のような順番をたどることが原因。
- `electron-vite build`
    `react`を一般的なwebサイトで配信するような形にビルド(バンドル)する。
    バンドルしたファイルをバンドラ(今回の例では`vite`)で指定したディレクトリに出力する。
- `electron-builder --<platform>`
    バンドルされたwebページ(今回の例ではreactのバンドル結果)を各プラットフォームで実行出来る形にビルドする。
    `electron-builder`で指定したディレクトリから**ビルド対象ファイル**を取得してビルドする。
    デフォルトでは`build/electron.js`を見に行く。
- このとき`electron-vite`の**バンドル結果**と`electron-builder`の**ビルド対象ディレクトリ**が一致していないと上記のように`not exist`エラーが発生する。

解決策として`electron-builder`のビルド対象を変更する。
`electron-builder`は次のいずれかの方法でビルド設定を定義する。
1. `package.json`の`build`プロパティを設定する。
2. プロジェクトルート(`package.json`のディレクトリ)に`electron-builder.yml`を作成する。

今回は2の方法を採用する。
`npm create @quick-start/electron`でプロジェクトを作成したときに作成される`electron-builder.yml`は以下の通り。
```yml
appId: com.electron.app
productName: electron
directories:
    buildResources: build
files:
    - '!**/.vscode/*'
    - '!src/*'
    - '!electron.vite.config.{js,ts,mjs,cjs}'
    - '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
    - '!{.env,.env.*,.npmrc,pnpm-lock.yaml}'
    - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
asarUnpack:
    - resources/**
win:
    executableName: electron
nsis:
    artifactName: ${name}-${version}-setup.${ext}
    shortcutName: ${productName}
    uninstallDisplayName: ${productName}
    createDesktopShortcut: always
mac:
    entitlementsInherit: build/entitlements.mac.plist
    extendInfo:
        - NSCameraUsageDescription: Application requests access to the device's camera.
        - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
        - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
        - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
    notarize: false
dmg:
    artifactName: ${name}-${version}.${ext}
linux:
    target:
        - AppImage
        - snap
        - deb
    maintainer: electronjs.org
    category: Utility
appImage:
    artifactName: ${name}-${version}.${ext}
npmRebuild: false
publish:
    provider: generic
    url: https://example.com/auto-updates
```

いくつか検証した結果「windowsを対象として一般的なインストーラをビルドする最小構成」は以下の通り。
```yml
appId: com.kettle.myapp
productName: postcard-print
extraMetadata:
    main: ./out/main/index.js
files:
    - ./out/**/*
win:
    target: nsis
nsis:
    artifactName: ${productName}-setup.${ext}
    shortcutName: ${productName}
    uninstallDisplayName: ${productName}
    createDesktopShortcut: false
    oneClick: false
    allowToChangeInstallationDirectory: true
    runAfterFinish: false
```
- `electron-vite build`で`./out/`にバンドル結果が出力される前提とする。
- `extraMetadata:main:`で**ビルド対象のエントリファイル**(エラー内容の`Application entry file "build/electron.js"`にあたるファイル)を指定する。
- `files:`でビルド結果に含める／含めないファイル群を指定する。

## 参考
- [electron-builderのエントリーポイントを変える方法 | 試行錯誤な日々](https://asukiaaa.blogspot.com/2019/09/electron-builder.html)
- [electron-builderがnode_modulesのディレクトリをapp.asarにパッケージングしない原因はapp/package.jsonに依存を書いていないからでした | ncaq](https://www.ncaq.net/2018/08/30/17/07/28/)
- [Electronプロジェクトのビルド | ByzantinePosts](https://mijinc0.github.io/blog/post/20200816_electron_builder/)
