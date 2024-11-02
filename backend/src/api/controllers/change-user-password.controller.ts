import { Request, Response } from "express";
import { z } from "zod";

export async function changeUserPasswordController(req: Request, res: Response){
    const changeUserPasswordSchema = z.object({
        email: z.string().email(),
    });

    const { email } = changeUserPasswordSchema.parse(req.body);


    try {
        
    } catch (error) {
        
    }
}