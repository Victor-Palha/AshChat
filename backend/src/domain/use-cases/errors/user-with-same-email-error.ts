export class UserWithSameEmailError extends Error {
    constructor() {
        super('User with same email already exists')
    }
}