import { createHash } from "node:crypto";

export function hashDeviceToken(device_token: string): string {
    return createHash("sha256").update(device_token).digest("hex");
}