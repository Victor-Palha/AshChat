import { Database } from "better-sqlite3";


export class UserRepository {
    private readonly database: Database;
    constructor(database: Database) {
        this.database = database;
    }


}