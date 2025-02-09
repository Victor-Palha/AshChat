import Database from 'better-sqlite3';
import {join} from 'node:path';

export class DatabaseManager extends Database {
    constructor() {
        super(join(__dirname, '../../../data/ashchat.db'));
    }
}

const db = new DatabaseManager();

// Migrations
// User information
// db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//         id TEXT PRIMARY KEY NOT NULL,
//         nickname VARCHAR(100),
//         description VARCHAR(100) NOT NULL,
//         photo_url TEXT,
//         preferred_language VARCHAR(10),
//         tag_user_id VARCHAR(100)
//     );
// `);

db.exec(`
    CREATE TABLE IF NOT EXISTS chats_labels (
        id TEXT PRIMARY KEY NOT NULL,
        chat_id TEXT NOT NULL,
        notifications INTEGER DEFAULT 0,
        FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );    
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY NOT NULL,
        nickname TEXT,
        description TEXT,
        profile_picture TEXT,
        preferred_language TEXT
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );    
`);


export default db;