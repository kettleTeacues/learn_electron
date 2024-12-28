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