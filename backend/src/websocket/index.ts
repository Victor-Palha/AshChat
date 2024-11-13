import { Server, Socket } from "socket.io";
import { Events } from "./factory/events.factory";
import { changeUserStatusFactory } from "../domain/factories/change-user-status.factory";
import { verify } from "jsonwebtoken";
import { env } from "../config/env";
import { verifyUniqueTokenDeviceFactory } from "../domain/factories/verify-user-unique-token-device.factory";

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
                const jwt_token = socket.handshake.auth.token as string
                const userId = this.verifyAuthByToken(jwt_token)
                const device_token = socket.handshake.auth.device_token as string
                this.verifyUserDeviceToken({ user_id: userId, device_token })
                
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

    private async verifyUserDeviceToken({ user_id, device_token }: { user_id: string, device_token: string }): Promise<void> {
        const service = verifyUniqueTokenDeviceFactory()
        const {isValid} = await service.execute({ user_id, deviceUniqueToken: device_token })
        if(!isValid){
            throw new Error("Authentication error: Invalid device token")
        }
    }
    
}