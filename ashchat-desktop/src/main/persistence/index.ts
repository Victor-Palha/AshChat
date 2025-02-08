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
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email VARCHAR(100) NOT NULL,
        nickname VARCHAR(100),
        jwt_token TEXT,
        jwt_refresh_token TEXT,
        unique_device_id TEXT,
        device_os TEXT,
        notification_token TEXT,
        user_id TEXT,
        temporary_token TEXT
    );
`);

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