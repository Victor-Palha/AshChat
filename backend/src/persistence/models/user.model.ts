import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
    nickname: string;
    email: string;
    password: string;
    online: boolean;
    preferredLanguage: string;
    chatsID: string[];
    contactsID: string[];
    devices: {
        deviceOS: string;
        deviceUniqueToken: string;
        deviceNotificationToken: string;
    };
}

const DevicesSchema = new Schema({
    deviceOS: { type: String, required: true },
    deviceUniqueToken: { type: String, required: true },
    deviceNotificationToken: { type: String, required: true }
});

const UserSchema = new Schema<UserDocument>({
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    devices: DevicesSchema,
    online: { type: Boolean, default: false },
    preferredLanguage: { type: String, required: true },
    chatsID: [{ type: String }],
    contactsID: [{ type: String }]
});

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
