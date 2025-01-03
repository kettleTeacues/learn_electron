// React HooksのuseStateのインポート (①)
import { useState, useEffect } from "react";
import './assets/App.css';

const App = () => {
    // 宛て先の郵便番号のステート(②)
    const [postcode, setPostcode] = useState("");
    const [post, setPost] = useState("検索中・・・");

    const getPostCode = (str, code) => {
        // strを改行コードごとに分割
        let tmp = str.split("\n");
        // tmp配列の各要素をループ
        tmp.forEach(element => {
            // 各要素から 「"」文字列を取り除く
            let el = element.replace(/"/g, '');
            //elを「,」ごとに分割
            let result = el.split(',');
            // resultの3番目の要素がcodeか調べる
            if (result[2] === code) {
                // ステートに住所をセット
                setPost(result[6] + result[7] + result[8]);
                // 関数から戻る
                return;
            }
        });
    }
    const getCsv = async () => {
        const str = await window.electronApi.openPrompt();
        let req = new XMLHttpRequest();
        // 今回の構成では src/renderer/ (index.htmlがある場所)がルートとなる。
        req.open('get', './KEN_ALL.CSV', true)
        req.send(null)
        console.log(req)

        req.onload = () => {
            getPostCode(req.responseText, str);
        }
        setPostcode(str);
    }
    useEffect(() => {
        // useEffectの中でasync関数を即時実行
        (async () => {
            await getCsv()
        })()
    }, [])

    return <div className="App">
        {/*宛て先の郵便番号(③)*/}
        <div className='to-code'> {postcode}</div>
        <div className="from-name">大西 ○○ </div>
        <div className="from-post">香川県〇〇郡〇〇町〇〇 </div>
        <div className="to-name">○○研究所様 </div>
        <div className="to-post">{post}</div>
        <div className="from-code">7660023</div>
    </div>
}
// App関数を外から呼び出せるように
export default App;
