export class UserCredentialsError extends Error {
    constructor() {
        super('Invalid credentials');
    }
}