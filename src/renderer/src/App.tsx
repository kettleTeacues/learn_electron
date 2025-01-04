// Reactモジュールのインポート
import { useEffect, useRef, useState } from 'react';
// スタイルシートのインポート
import './App.css';

const App = () => {
    const todoRef = useRef<HTMLInputElement>(null);

    const [state, setState] = useState({
        list: [{ id: 0, value: "ToDoリストを書く" },],
    });

    // const insert = async (e: any) => {
    //     let array = state.list;
    //     const id = state.list.length;
    //     const val = todoRef?.current?.value;

    //     array.push({ id: id, value: val || '' });
    //     setState({ list: array });
    // }
    const select = async () => {
        const rows = await window.electronApi.execSql('select')
        const array: any[] = []

        for (const row of rows) {
            array.push({id: row.id, value: row.todo})
        }
        setState({list: array})
    }
    const create = async () => {
        // DB自体を作成する。
        await window.electronApi.execSql('create')
    }
    const insert = async (e) => {
        const val = todoRef?.current?.value
        await window.electronApi.execSql('insert', val)
        select()
    }
    useEffect(() => {
        create()
        select()
    }, [])

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
