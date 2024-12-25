import { Request, Response } from "express";
import { generateToken } from "../../helper/generate-token-helper";
import { findUserByIdFactory } from "../../domain/factories/find-user-by-id.factory";
import { UserNotFoundError } from "../../domain/use-cases/errors/user-not-found-error";
import { hashDeviceToken } from "../../helper/hash-device-token-helper";

function validateRequest(req: Request): { sub: string, device_token: string } | null {
    const { sub } = req.user_id;
    const device_token = req.headers["device_token"];
    if (!sub || !device_token || typeof device_token !== "string") {
        return null;
    }
    return { sub, device_token };
}

async function getUserDevices(sub: string) {
    const getUserByIdService = findUserByIdFactory();
    return getUserByIdService.execute(sub);
}

function generateTokens(sub: string) {
    const refresh_token = generateToken({
        subject: sub,
        expiresIn: "7d",
        type: "REFRESH"
    });

    const token = generateToken({
        subject: sub,
        expiresIn: "30m",
        type: "MAIN"
    });

    return { token, refresh_token };
}

export async function refreshTokenController(req: Request, res: Response): Promise<any> {
    const requestData = validateRequest(req);
    if (!requestData) {
        return res.status(401).send({ message: "Invalid Request" });
    }

    const { sub, device_token } = requestData;
    const deviceUniqueTokenHashed = hashDeviceToken(device_token);

    try {
        const { devices } = await getUserDevices(sub);
        if (devices.deviceUniqueToken !== deviceUniqueTokenHashed) {
            return res.status(401).send({ message: "Invalid Request" });
        }

        const { token, refresh_token } = generateTokens(sub);
        return res.status(200).send({ token, refresh_token });
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            return res.status(404).send({ message: "User not found" });
        }
        return res.status(500).send({ message: "Internal Server Error" });
    }
}