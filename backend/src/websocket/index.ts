import { Server, Socket } from "socket.io";
import { Events } from "./factory/events.factory";
import { changeUserStatusFactory } from "../domain/factories/change-user-status.factory";
import { verify } from "jsonwebtoken";
import { env } from "../config/env";

interface PayloadJWT{
    sub: string
}

export class IOServer {
    public _io: Server

    constructor(io: Server) {
        this._io = io
    }

    public initialize() {
        const changeUserStatus = changeUserStatusFactory()

        this._io.on("connection", (socket: Socket) => {
            console.log("New client connected");
            try {
                const token = socket.handshake.query.token as string
                const userId = this.verifyAuthByToken(token)
                socket.join(`user_${userId}`)
                changeUserStatus.execute({ userId, online: true})
                // All events are handled in the Events factory
                Events(socket, this)
    
                socket.on("disconnect", async () => {
                    console.log(`Client disconnected: ${userId}`);
    
                    await changeUserStatus.execute({ userId, online: false });
                });

            } catch (error) {
                console.log(error)
                socket.disconnect()
            }
        })
    }

    private verifyAuthByToken(token: string): string {
        if (!token) {
            throw new Error("Authentication error: No token provided");
          }
    
          try {
            const payload = verify(token, env.JWT_SECRET)as PayloadJWT;
            // Aqui, você pode adicionar o payload aos dados do socket para referência futura
            const user_id = payload.sub;
            return user_id

          } catch (error) {
            throw new Error("Authentication error: Invalid token");
          }
    }
    
}