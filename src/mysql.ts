//@ts-ignore
import * as spinMysql from "fermyon:spin/mysql@2.0.0"
import { RdbmsParameterValue, RdbmsRow, RdbmsRowSet, SpinRdbmsRowSet } from "./types/rdbms"
import { convertRdbmsToWitTypes } from "./rdbms-helper"

export interface SpinMysqlConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet
    execute: (statement: string, params: RdbmsParameterValue[]) => number
}

function createMysqlConnection(connection: spinMysql.Connection): SpinMysqlConnection {
    return {
        query: (statement: string, params: RdbmsParameterValue[]) => {
            let santizedParams = convertRdbmsToWitTypes(params)
            let ret = connection.query(statement, santizedParams) as SpinRdbmsRowSet
            let results: RdbmsRowSet = {
                columns: ret.columns,
                rows: []
            }
            ret.rows.map((k: RdbmsRow, rowIndex: number) => {
                results.rows.push({})
                k.map((val, valIndex: number) => {
                    results.rows[rowIndex][results.columns[valIndex].name] = (val.tag == "db-null" || val.tag == "unsupported") ? null : val.val
                })
            })
            return results
        },
        execute: (statement: string, params: RdbmsParameterValue[]) => {
            let santizedParams = convertRdbmsToWitTypes(params)
            let ret = connection.execute(statement, santizedParams) as number
            return ret
        }
    }
}

export const Mysql = {
    open: (address: string): SpinMysqlConnection => {
        return createMysqlConnection(spinMysql.Connection.open(address))
    }
}