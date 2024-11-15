import { createContext, useEffect, useState } from "react"
import ApiClient from "../api"
import SecureStoragePersistence from "../persistence/SecureStorage"
import { randomUUID } from 'expo-crypto';
import { Alert, Platform } from "react-native";
import { router } from "expo-router";

type AuthState = {
    token: string | null,
    authenticated: boolean | null
}
interface AuthProps {
    authState: AuthState,
    isLoading: boolean,
    onRegister: (email: string, password: string, nickname: string, preferredLanguage: string) => Promise<any>,
    onLogin: (email: string, password: string, deviceUniqueToken: string) => Promise<any>,
    onConfirmSignUp: (emailCode: string) => Promise<any>
}

export const AuthContext = createContext<AuthProps>({} as AuthProps)

export function AuthProvider({children}: {children: React.ReactNode}){

    const [authState, setAuthState] = useState<AuthState>({token: null, authenticated: null})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=> {
        const safeStorage = SecureStoragePersistence
        async function checkToken(){
            const token = await safeStorage.getJWT()
            const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
            if(!deviceUniqueToken){
                const deviceUniqueToken = randomUUID()
                await safeStorage.setUniqueDeviceId(deviceUniqueToken)
            }
            if(token){
                setAuthState({token, authenticated: true})
                ApiClient.setTokenAuth(token)
            } else {
                setAuthState({token: null, authenticated: false})
            }
        }
        checkToken().finally(()=>{
            setIsLoading(false)
        })
    }, [])
    
    const api = ApiClient
    const safeStorage = SecureStoragePersistence

    async function onLogin(email: string, password: string){

        try {
            const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
            if(!deviceUniqueToken){
                return 
            }
            // Call the login endpoint
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

    async function onRegister(email: string, password: string, nickname: string, preferredLanguage: string){
        const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
        try {
            if(!deviceUniqueToken){
                return 
            }
            // Call the register endpoint
            const response = await api.server.post('/user/register', {email, password, nickname, preferredLanguage, deviceUniqueToken})

            if(response.status === 202){
                Alert.alert('Success', "You have successfully registered. Please check your email to confirm your account.")
                safeStorage.setEmail(email)
                safeStorage.setDeviceOS(Platform.OS)
                safeStorage.setNotificationToken(randomUUID())
                router.push('/confirmsignup')
            }
            
        } catch (error) {
            Alert.alert('Error', "An error occurred while trying to register. Please try again.")
        }

    }

    async function onConfirmSignUp(emailCode: string){
        try {
            const email = await safeStorage.getEmail()
            const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
            const deviceOS = await safeStorage.getDeviceOS()
            const deviceNotificationToken = await safeStorage.getNotificationToken()

            if(!email || !deviceUniqueToken || !deviceOS){
                Alert.alert('Error', "An error occurred while trying to confirm your account. Please try again.")
            }

            const response = await api.server.post('/user/confirm-email', {
                email, 
                emailCode, 
                deviceOS, 
                deviceUniqueToken, 
                deviceNotificationToken
            })

            if(response.status === 201){
                Alert.alert('Success', "You have successfully confirmed your account. Please login to continue.")
                router.push('/login')
            }
        } catch (error) {
            Alert.alert('Error', "An error occurred while trying to confirm your account. Please try again.")
        }
    }

    const values = {authState, onRegister, onLogin, isLoading, onConfirmSignUp}

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}