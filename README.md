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

# WebDriverIOをインストール'
参考: https://webdriver.io/docs/gettingstarted#initiate-a-webdriverio-setup
```sh
yarn create wdio .
```
