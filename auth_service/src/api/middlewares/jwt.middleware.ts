import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { env } from "../../config/env";

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
export function jwtMiddleware(req: Request, res: Response, next: NextFunction): Promise<any> | any {
    const authToken = req.headers.authorization
    if(!authToken){
        return res.status(401).end()
    }

    const [, token] = authToken.split(" ")

    try {
        const decoded = verify(token, env.JWT_SECRET) as JwtPayload;

        if (!decoded.sub) {
            return res.status(401).json({ message: 'Token inválido: sub não encontrado' });
        }

        req.user_id = { sub: decoded.sub };

        return next();
    } catch (error) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }

        return res.status(401).json({ message: 'Token inválido' });
    }
}