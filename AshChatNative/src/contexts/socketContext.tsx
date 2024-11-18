import React, { createContext, useEffect, useState } from "react";
import { IOClient } from "../api/sockets";
import { MMKVStorage } from "../persistence/MMKVStorage";
import { useMMKVString } from "react-native-mmkv";

type SocketProps = {
    ioServer: IOClient,
    mmkvStorage: MMKVStorage,
    user_id: string | undefined
}

export const SocketContext = createContext<SocketProps>({} as SocketProps)

const mmkvStorage = new MMKVStorage()
const ioServer = new IOClient()
ioServer.connect()

export function SocketProvider({children}: {children: React.ReactNode}){
    const [user_id] = useMMKVString("ashchat.user_id")

    useEffect(() => {
        ioServer.socket.on("user-connected", ({user_id})=>{
            mmkvStorage.setUserId(user_id)
        })
    }, [])

    const values = {
        ioServer,
        mmkvStorage,
        user_id
    }

    return (
        <SocketContext.Provider value={values}>
            {children}
        </SocketContext.Provider>
    )
}