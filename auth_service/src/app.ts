import express, { NextFunction, Request, Response } from 'express';
import { userRoutes } from './api/routes';
import { ZodError } from 'zod';
import cors from 'cors';

const CONFIG_SERVER = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
}

const app = express();
// Global middlewares
app.use(cors(CONFIG_SERVER.cors));
app.use(express.json());
// Routes
app.use("/api", userRoutes)
//Error Handler
app.use((err:Error, _req:Request, res:Response, _next: NextFunction): any => {
    if(err instanceof ZodError){
        //if are error
        return res.status(400).json({
            mesage: "Invalid data",
            error: err.issues,
        })
    }

    if(err instanceof Error){
        //if are error
        return res.status(500).json({
            error: err.message
        })
    }

    return res.status(500).json({status: "error", message:"Internal server error"})
})

export {
    app
}