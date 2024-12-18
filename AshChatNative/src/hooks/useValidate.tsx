import { useCallback, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { router, useFocusEffect } from "expo-router";

export function useValidate(){
    const {authState} = useContext(AuthContext)
    useFocusEffect(useCallback(()=> {
        if(!authState.authenticated){
            return
        }
        if(authState.authenticated){
            console.log('Authenticated')
            router.replace('/private/home')
        }
    }, []))
}