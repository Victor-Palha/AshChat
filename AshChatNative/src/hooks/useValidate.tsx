import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { useMMKVString } from "react-native-mmkv";

export function useValidate(){
    const [isTokenValid] = useMMKVString("ashchat.jwt")
    // const {authState} = useContext(AuthContext)
    useFocusEffect(useCallback(()=> {
        if(!isTokenValid){
            console.log('Not Authenticated')
            return
        }
        if(isTokenValid){
            console.log('Authenticated')
            router.replace('/private/home')
        }
    }, [isTokenValid]))
}