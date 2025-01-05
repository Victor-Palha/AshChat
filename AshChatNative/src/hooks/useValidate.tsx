import { useCallback, useContext } from "react";
import { router, useFocusEffect } from "expo-router";
import { useMMKVString } from "react-native-mmkv";
import { AuthContext } from "../contexts/authContext";

export function useValidate(){
    const [isTokenValid] = useMMKVString("ashchat.jwt")
    const {authState} = useContext(AuthContext)
    useFocusEffect(useCallback(()=> {
        if(!isTokenValid || !authState.authenticated){
            console.log('Not Authenticated')
            return
        }
        if(isTokenValid && authState.authenticated){
            console.log('Authenticated')
            router.replace('/private/home')
        }
    }, [isTokenValid, authState]))
}