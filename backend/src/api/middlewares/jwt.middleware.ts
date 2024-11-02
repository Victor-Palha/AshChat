import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { env } from "../../config/env";

interface PayloadJWT{
    sub: string
}

/**
 * Middleware to verify JWT token from the request headers.
 * 
 * This middleware checks for the presence of an authorization token in the request headers.
 * If the token is not present, it responds with a 401 status code.
 * If the token is present, it verifies the token using the secret key.
 * If the token is valid, it extracts the user ID (sub) from the token payload and attaches it to the request object.
 * If the token is invalid, it responds with a 401 status code.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
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