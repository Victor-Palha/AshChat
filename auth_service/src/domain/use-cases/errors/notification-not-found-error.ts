export class NotificationNotFoundError extends Error {
    constructor() {
        super('Notification not found');
    }
}