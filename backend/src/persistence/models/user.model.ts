import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
    nickname: string;
    email: string;
    password: string;
    online: boolean;
    preferredLanguage: string;
    chatsID: string[];
    contactsID: string[];
}

const UserSchema = new Schema<UserDocument>({
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    online: { type: Boolean, default: false },
    preferredLanguage: { type: String, required: true },
    chatsID: [{ type: String }],
    contactsID: [{ type: String }]
});

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
