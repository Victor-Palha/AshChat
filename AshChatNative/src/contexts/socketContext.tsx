import React, { createContext } from "react";
import { IOClient } from "../api/sockets";

type SocketProps = {
    ioServer: IOClient
}

export const SocketContext = createContext<SocketProps>({} as SocketProps)

export function SocketProvider({children}: {children: React.ReactNode}){
    const ioServer = new IOClient()
    ioServer.connect()
    const values = {
        ioServer
    }

    return (
        <SocketContext.Provider value={values}>
            {children}
        </SocketContext.Provider>
    )
}