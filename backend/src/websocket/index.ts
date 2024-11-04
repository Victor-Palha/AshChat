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
                const token = socket.handshake.auth.token as string
                const userId = this.verifyAuthByToken(token)
                socket.join(`user_${userId}`)
                changeUserStatus.execute({ userId, online: true})

                Events(socket, this)
    
                socket.on("disconnect", async () => {
                    console.log(`Client disconnected: ${userId}`);
    
                    await changeUserStatus.execute({ userId, online: false });
                });
                this._io.to(`user_${userId}`).emit("user-connected", { user_id: userId.trim() });
            } catch (error) {
                console.log(error)
                socket.disconnect()
            }
        })
    }

    public verifyAuthByToken(token: string): string {
        if (!token) {
            throw new Error("Authentication error: No token provided");
          }
    
          try {
            const payload = verify(token, env.JWT_SECRET)as PayloadJWT;
            const user_id = payload.sub;
            return user_id

          } catch (error) {
            throw new Error("Authentication error: Invalid token");
          }
    }
    
}