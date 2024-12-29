// Reactモジュールのインポート
import React, { Component } from 'react';
// スタイルシートのインポート
import './App.css';

// Component クラスを継承したAppクラスの宣言(①)
class App extends Component {
    todoRef: any

    // state 辞書の宣言(②)
    state = {
        // listキーに配列のバリューをセット
        list: [{ id: 0, value: "ToDoリストを書く" },],
    };
    // コンストラクタ (3)
    constructor(props) {
        // 親クラスのComponentクラスのコンストラクタを呼び出す
        super(props);
        this.todoRef = React.createRef();
    }
    insert(e: any) {
        // this.state.list配列を array変数に代入 -
        let array = this.state.list;
        // this.state.listの要素数をid番号に代入
        const id = this.state.list.length;
        const val = this.todoRef.current.value;
        // array配列に辞書型の要素を追加
        array.push({ id: id, value: val });
        this.setState({ list: array });
    }

    render() {// HTML5を返す
        return <div className="App">
            {/*テーブルタグ */}
            <table>
                {/*テーブルヘッドタグ*/}
                <thead> <tr><td>
                    {/*ボタンタグ */}
                    <button onClick={this.insert.bind(this)}>
                        add
                    </button>
                    {/*テーブル項目タグ */}
                </td><td>
                    <input type="text" ref={this.todoRef} size={50} />
                </td></tr></thead>
                {/*テーブルボディータグ */}
                <tbody>
                    {/*state.listの配列をループしてテーブルに一覧表を表示する (⑤) */}
                    {this.state.list.map(item => <tr key={item.id}>
                        <td>{item.id}</td><td>{item.value}</td>
                    </tr>)}
                    {/*テーブルボディタグを閉じる */}
                </tbody>
                {/*テーブルタグを閉じる */}
            </table>
            {/*ディバイデッドタグを閉じる */}
        </div>
    }
}
// Appクラスを他のファイルからインポートできるように
export default App;
