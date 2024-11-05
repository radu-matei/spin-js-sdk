//@ts-ignore
import * as spinPg from 'fermyon:spin/postgres@2.0.0';
import { convertRdbmsToWitTypes } from './rdbmsHelper';
function createPostgresConnection(connection) {
    return {
        query: (statement, params) => {
            let santizedParams = convertRdbmsToWitTypes(params);
            let ret = connection.query(statement, santizedParams);
            let results = {
                columns: ret.columns,
                rows: [],
            };
            ret.rows.map((k, rowIndex) => {
                results.rows.push({});
                k.map((val, valIndex) => {
                    results.rows[rowIndex][results.columns[valIndex].name] =
                        val.tag == 'db-null' || val.tag == 'unsupported' ? null : val.val;
                });
            });
            return results;
        },
        execute: (statement, params) => {
            let santizedParams = convertRdbmsToWitTypes(params);
            let ret = connection.execute(statement, santizedParams);
            return ret;
        },
    };
}
/**
 * Opens a PostgreSQL connection to the specified address.
 * @param {string} address - The address of the PostgreSQL server.
 * @returns {PostgresConnection} The PostgreSQL connection object.
 */
export function open(address) {
    return createPostgresConnection(spinPg.Connection.open(address));
}
