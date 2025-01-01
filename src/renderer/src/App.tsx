import { useState, useEffect, useLayoutEffect } from "react";
import './App.css';

import pixabayImg from './images/pixabay.svg'
// 正解音のサウンドファイルのインポート (1)
import rightSnd from "./sounds/Right.mp3";
// 間違い音のサウンドファイルのインポート
import mistakeSnd from "./sounds/Mistake.mp3";

function App() {
    const MIN_NUM = 3; // 画像の最小表示枚数
    const [stage, setStage] = useState(0); // 問題のステージ番号
    const [number, setNumber] = useState(MIN_NUM); // 一度に表示する画像の数だが、 この節では1枚だけ表示
    const [title, setTitle] = useState("スタート"); // タイトル兼スタートボタン
    const [images, setImages] = useState<string[]>([]);
    const [word, setWord] = useState("");
    const keyword = ['犬', 'ピアノ', '猫', 'ギター', '車']

    // Sounds
    const right = new Audio(rightSnd);
    const mistake = new Audio(mistakeSnd);

    useEffect (() => {
        // スタートメニューがクリックされたらチャンネルを受け取る
        window.api.onReceiveMessage((e, data) => {
            console.log('client', e, data)
            start(e)
        })
    }, [])
    useLayoutEffect(() => {
        // ゲーム開始時でなければ画像を表示
        if (title != "スタート") {
            // addImage 関数の呼び出し
            addImage(null, stage, number);
        }
    }, [stage, number]);
    // ゲーム開始ボタンが押されたら呼ばれる
    const start = (e) => {
        // タイトル画面をセット
        setTitle("画像検索ワード当てクイズ");
        // 画像を表示
        addImage(null, stage, number);
    }
    const answer = (e) => {
        // 答えが正しいか調べる
        if (keyword[stage] === word) {
            // 正解音を鳴らす(4)
            right.play();
            // 問題のステージを次へ
            setStage((stage + 1) % keyword.length);
            // 初期ヒント画像を3つに
            setNumber(MIN_NUM);
            // 答えが正しくない場合
        } else {
            // 間違い音を鳴らす
            mistake.play();
            // ヒント画像を1つ増やす
            setNumber(number + 1);
        }
    }
    // 画像の追加
    const addImage = (e: any, stg: number, num: number) => {
        // リモートリソースを非同期で取り込み (②)
        const url = createURL(keyword[stg], num)
        console.log(url)
        fetch(url)
            // 受け取ったデータを次のthenに渡す
            .then(function (data) {
                // 取得したデータをJSONデータとして返す
                return data.json();
            })
            // JSONデータを受け取る
            .then(function (json) {
                console.log(json)
                // JSONをもとに画像URLをセット
                createImage(json);
            })
    }
    const createURL = (value, num) => {
        // Web APIのキー
        const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
        // ベースになるURL
        const baseUrl = 'https://pixabay.com/api/?key=' + API_KEY;
        // 検索するキーワードの文字列
        const keyword = '&q=' + encodeURIComponent(value);
        // 画像を水平にし画像の数を指定
        const option = '&orientation=horizontal&per_page=' + num;
        // baseUrl と keyword と option を繋げた文字列をURL定数に代入
        const URL = baseUrl + keyword + option;
        // URL を返す
        return URL;
    }
    const createImage = (json) => {
        // array配列を空で宣言
        let array: string[] = [];
        // JSONの合計ヒット数が1つ以上ある場合
        if (json.totalHits > 0) {
            // JSONのヒット配列をループ(4)
            json.hits.forEach((value: any) => {
                // array配列にvalue.webformatURLの値を追加
                array.push(value.webformatURL);
                // array配列をimagesステートにセット
                setImages(array);
            })
        }
    }

    return <div className="App">
        <header>
            <h1 onClick={e => start(e)}>{title}</h1>
            <input type="text" onChange={(e) => setWord(e.target.value)}></input>
            <button onClick={(e) => answer(e)}>答える</button>
        </header>

        <div>{
            images.map((src, i) => <img src={src} key={i} alt="問題" />)
        }</div>

        <p><a href="https://pixabay.com" target="_blank">
            <img src={pixabayImg} alt="Pixabay" />
        </a></p>
    </div>
}
export default App;
