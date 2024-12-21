import { Algorithm, sign } from "jsonwebtoken";
import { env } from "../config/env";

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

    let JWT_SECRET = ""
    let ALGORITHM: Algorithm = "HS256"

    switch(type){
        case "MAIN":
            JWT_SECRET = env.JWT_SECRET
            ALGORITHM = "RS256"
            break
        case "TEMPORARY":
            JWT_SECRET = env.JWT_TEMPORARY_TOKEN
            break
    }

    return sign(payload, JWT_SECRET, {
        subject: subject,
        expiresIn: expiresIn,
        algorithm: ALGORITHM
    });
}