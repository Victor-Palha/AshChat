export class ChatNotFoundError extends Error {
    constructor() {
        super('Chat not found');
    }
}