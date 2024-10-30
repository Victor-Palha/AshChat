import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { env } from "../../config/env";

interface PayloadJWT{
    sub: string
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction){
    //receive token
    const authToken = req.headers.authorization
    if(!authToken){
        return res.status(401).end()
    }

    const [, token] = authToken.split(" ")

    try {
        const {sub} = verify(token, env.JWT_SECRET) as PayloadJWT

        req.user_id = {
            sub
        }

        return next()
    } catch (error) {
        return res.status(401).end()
    }
}