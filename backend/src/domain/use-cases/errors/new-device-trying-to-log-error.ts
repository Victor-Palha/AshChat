export class NewDeviceTryingToLogError extends Error {
    constructor() {
        super("New device trying to log in");
    }
}