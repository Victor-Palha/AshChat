import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/auth/authContext";
import { useNavigate } from "react-router-dom";
import LocalStoragePersistence from "../lib/local-storage-persistence";

export function useValidate(){
    const navigate = useNavigate()
    const {authState} = useContext(AuthContext)
    const isTokenValid = LocalStoragePersistence.getJWT();

    useEffect(()=> {
        if(!isTokenValid || !authState.authenticated){
            console.log('Not Authenticated')
            return
        }
        if(isTokenValid && authState.authenticated){
            console.log('Authenticated')
            navigate('/home')
        }
    }, [isTokenValid, authState])
}