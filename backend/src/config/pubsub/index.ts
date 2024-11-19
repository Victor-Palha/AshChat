import { Notification } from "../../domain/entities/notification"

type NotificationSub = {
    receiver: string,
    notifications: Notification[]
}

export class Pubsub {
    private content: NotificationSub[] = []

    public addNotification({receiver_id, notification}: {receiver_id: string, notification: Notification}){
        const receiver = this.findReceiver(receiver_id)
        if(receiver){
            receiver.notifications.push(notification)
        }
        else{
            this.content.push({receiver: receiver_id, notifications: [notification]})
        }
    }

    public getNotifications(receiver_id: string){
        const receiver = this.findReceiver(receiver_id)
        if(receiver){
            const notifications = receiver.notifications
            receiver.notifications = []
            return notifications
        }
    }

    private findReceiver(receiver_id: string){
        const receiver = this.content.find(({receiver})=> receiver === receiver_id)
        return receiver
    }
}