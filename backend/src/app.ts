import express, { NextFunction, Request, Response } from 'express';
import {createServer} from 'node:http';
import { Server } from 'socket.io';
import { userRoutes } from './api/routes';
import { ZodError } from 'zod';
import cors from 'cors';

/**
 * Configuration object for the server.
 * 
 * @property {Object} cors - CORS configuration.
 * @property {string} cors.origin - Specifies the origin(s) that are allowed to access the server. 
 *                                  Use '*' to allow all origins.
 * @property {string[]} cors.methods - Array of HTTP methods that are allowed.
 */
const CONFIG_SERVER = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
}

const expressServer = express();
expressServer.use(cors(CONFIG_SERVER.cors));

expressServer.use(express.json());
expressServer.use("/api", userRoutes)
//Errors
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