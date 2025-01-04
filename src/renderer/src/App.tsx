// Reactモジュールのインポート
import { useRef, useState } from 'react';
// スタイルシートのインポート
import './App.css';

const App = () => {
    const todoRef = useRef<HTMLInputElement>(null);

    const [state, setState] = useState({
        list: [{ id: 0, value: "ToDoリストを書く" },],
    });

    const insert = (e: any) => {
        let array = state.list;
        const id = state.list.length;
        const val = todoRef?.current?.value;

        array.push({ id: id, value: val || '' });
        setState({ list: array });
    }

    return <div className="App">
        <table>
            <thead> <tr><td>
                <button onClick={insert.bind(this)}>
                    add
                </button>
            </td><td>
                    <input type="text" ref={todoRef} size={50} />
                </td></tr></thead>
            <tbody>
                {state.list.map(item => <tr key={item.id}>
                    <td>{item.id}</td><td>{item.value}</td>
                </tr>)}
            </tbody>
        </table>
    </div>
}
export default App
