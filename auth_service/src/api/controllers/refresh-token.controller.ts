import { Request, Response } from "express";
import { generateToken } from "../../helper/generate-token-helper";

export async function refreshTokenController(req: Request, res: Response): Promise<any>{
    const {sub} = req.user_id;
    try {
        const refresh_token = generateToken({
            subject: sub,
            expiresIn: "7d",
            type: "REFRESH"
        })

        const token = generateToken({
            subject: sub,
            expiresIn: "30m",
            type: "MAIN"
        })

        return res.status(200).send({
            token,
            refresh_token
        })
    } catch (error) {
        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}