import { sign } from "jsonwebtoken";
import { env } from "../config/env";
import { readFileSync } from "node:fs";

type GenerateToken = {
    subject: string,
    expiresIn: string
    type: "MAIN" | "TEMPORARY"
}
/**
 * Generates a JSON Web Token (JWT) based on the provided parameters.
 *
 * @param {Object} params - The parameters for generating the token.
 * @param {string} params.subject - The subject of the token.
 * @param {string} params.expiresIn - The expiration time of the token.
 * @param {string} params.type - The type of the token, either "MAIN" or another type.
 * @returns {string} The generated JWT.
 */

export function generateToken({subject, expiresIn, type}: GenerateToken): string {
    const payload = {
        type: type
    };

    if(type === "MAIN"){
        return sign(payload, env.JWT_SECRET, {
            subject: subject, 
            expiresIn: expiresIn,
            algorithm: "RS256"
        })
    }
    return sign(payload, env.JWT_TEMPORARY_TOKEN, {subject: subject, expiresIn: expiresIn})
}