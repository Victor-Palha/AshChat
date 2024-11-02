import { sign } from "jsonwebtoken";
import { env } from "../config/env";

type GenerateToken = {
    subject: string,
    expiresIn: string
    type: "MAIN" | "TEMPORARY"
}
export function generateToken({subject, expiresIn, type}: GenerateToken): string {
    const payload = {
        type: type
    };

    if(type === "MAIN"){
        return sign(payload, env.JWT_SECRET, {subject: subject, expiresIn: expiresIn})
    }
    return sign(payload, env.JWT_TEMPORARY_TOKEN, {subject: subject, expiresIn: expiresIn})
}