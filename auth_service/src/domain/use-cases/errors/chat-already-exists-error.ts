export class ChatAlreadyExistsError extends Error {
    constructor() {
        super('Chat already exists')
    }
}