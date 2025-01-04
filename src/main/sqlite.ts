import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose()

export class SqlClient {
    db: sqlite3.Database
    id: number | undefined
    change: number | undefined

    constructor(dbFileName: string) {
        this.db = new sqlite.Database(dbFileName)
    }

    run = (sql: string, param?: string) => {
        const p = new Promise((ok, ng) => {
            this.db.run(sql, param, (err, res) => {
                let id = this.id || -1
                let change = this.change || -1

                if (err) {
                    ng(new Error(err))
                } else {
                    ok({id: id, change: change})
                }
            })
        })
        return p
    }
    all = (sql: string, param?: string) => {
        const p = new Promise((ok, ng) => {
            this.db.all(sql, param, (err, res) => {
                if (err) {
                    ng(new Error(`${err}`))
                } else {
                    ok(res)
                }
            })
        })
        return p
    }
}
