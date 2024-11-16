import express, { NextFunction, Request, Response } from 'express';
import {createServer} from 'node:http';
import { Server } from 'socket.io';
import { userRoutes } from './api/routes';
import { ZodError } from 'zod';
import cors from 'cors';

const CONFIG_SERVER = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
}

const expressServer = express();
// Global middlewares
expressServer.use(cors(CONFIG_SERVER.cors));
expressServer.use(express.json());
// Routes
expressServer.use("/api", userRoutes)
//Error Handler
expressServer.use((err:Error, _req:Request, res:Response, _next: NextFunction): any => {
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

const app = createServer(expressServer);
const IO = new Server(app, CONFIG_SERVER);

export {
    app,
    IO
}