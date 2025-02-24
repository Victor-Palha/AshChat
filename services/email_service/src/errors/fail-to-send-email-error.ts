export class FailToSendEmailError extends Error{
    constructor(){
        super("Fail to send email")
    }
}