import { createContext, useEffect, useState } from "react"
import ApiClient from "../api"
import SecureStoragePersistence from "../persistence/SecureStorage"
import { randomUUID } from 'expo-crypto';
import { Alert } from "react-native";

type AuthState = {
    token: string | null,
    authenticated: boolean | null
}
interface AuthProps {
    authState: AuthState,
    isLoading: boolean,
    onRegister: (email: string, password: string, nickname: string, preferredLanguage: string) => Promise<any>,
    onLogin: (email: string, password: string, deviceUniqueToken: string) => Promise<any>,
}

export const AuthContext = createContext<AuthProps>({} as AuthProps)

export function AuthProvider({children}: {children: React.ReactNode}){

    const [authState, setAuthState] = useState<AuthState>({token: null, authenticated: null})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=> {
        const safeStorage = SecureStoragePersistence
        async function checkToken(){
            const token = await safeStorage.getJWT()
            if(token){
                setAuthState({token, authenticated: true})
                ApiClient.setTokenAuth(token)
            } else {
                setAuthState({token: null, authenticated: false})
            }
        }
        checkToken()
        setIsLoading(false)
    }, [])

    async function onLogin(email: string, password: string, deviceUniqueToken: string){
        // Call the login endpoint
        const api = ApiClient
        const safeStorage = SecureStoragePersistence
        try {
            const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
            if(!deviceUniqueToken){
                const deviceUniqueToken = randomUUID()
                await safeStorage.setUniqueDeviceId(deviceUniqueToken)
                return 
            }
            const response = await api.server.post('/user/login', {email, password, deviceUniqueToken})
            const token = response.data.token

            // Save the token to the secure storage
            await safeStorage.setJWT(token)
            // Set the token to the axios instance
            api.setTokenAuth(token)

            // Set the token to the state
            setAuthState({token, authenticated: true})
        } catch (error) {
            Alert.alert('Error', "An error occurred while trying to login. Please try again.")
        }
    }

    return (
        <AuthContext.Provider value={{authState, onRegister: async (email, password, nickname, preferredLanguage) => {}, onLogin, isLoading}}>
            {children}
        </AuthContext.Provider>
    )
}