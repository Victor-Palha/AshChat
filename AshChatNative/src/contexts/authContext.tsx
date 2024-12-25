import { createContext, useEffect, useState } from "react"
import SecureStoragePersistence from "../persistence/SecureStorage"
import { randomUUID } from 'expo-crypto';
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { MMKVStorage } from "../persistence/MMKVStorage";
import { AuthAPIClient } from "../api/auth-api-client";
import { backupMessages } from "../utils/backupMessages";
import { AxiosError } from "axios";

const MMKV = new MMKVStorage()
const api = AuthAPIClient
const safeStorage = SecureStoragePersistence

type AuthState = {
    token: string | null,
    user_id: string | null,
    authenticated: boolean | null
}
interface AuthProps {
    authState: AuthState,
    isLoading: boolean,
    onRegister: (email: string, password: string, nickname: string, preferredLanguage: string) => Promise<any>,
    onLogin: (email: string, password: string) => Promise<any>,
    onConfirmSignUp: (emailCode: string) => Promise<any>,
    onLogout(): Promise<void>
}

export const AuthContext = createContext<AuthProps>({} as AuthProps)

export function AuthProvider({children}: {children: React.ReactNode}){
    const [authState, setAuthState] = useState<AuthState>({token: null, authenticated: null, user_id: null})
    const [isLoading, setIsLoading] = useState(true)
    const [isChecking, setIsChecking] = useState(false);

    async function validateToken(token: string): Promise<boolean>{
        const api = AuthAPIClient
        api.setTokenAuth(token)
        const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
        if(!deviceUniqueToken) return false
        api.setHeader("device_token", deviceUniqueToken)
        const response = await api.server.get("/user/refresh-token")
        if(response.status == 401){
            console.log('Token expired')
            await safeStorage.clearTokens()
            MMKV.clearToken()
        }
        if(response.status != 200){
            return false
        }
        const {token: newToken, refresh_token} = response.data
        await safeStorage.setJWT(newToken)
        await safeStorage.setRefreshToken(refresh_token)
        MMKV.setToken(newToken)
        api.setTokenAuth(newToken)
        return true
    }

    async function checkToken() {
        if (isChecking) return;
        if (authState.authenticated === false) return;
        setIsChecking(true);
        const token = await safeStorage.getRefreshToken();
        const deviceUniqueToken = await safeStorage.getUniqueDeviceId();
        const user_id = await safeStorage.getUserId();

        if (!deviceUniqueToken) {
            const newDeviceUniqueToken = randomUUID();
            await safeStorage.setUniqueDeviceId(newDeviceUniqueToken);
        }

        if (token) {
            const isValid = await validateToken(token);
            if (!isValid) {
                setAuthState({ token: null, authenticated: false, user_id });
                setIsChecking(false);
                return;
            }
            setAuthState({ token, authenticated: true, user_id });
        } else {
            setAuthState({ token: null, authenticated: false, user_id });
        }
        setIsChecking(false);
    }

    useEffect(() => {
        checkToken().finally(() => {
            setIsLoading(false);
        });
        
        const minute = 60 * 1000 // 1 min
        const fithteenMinutes = minute * 15 // 15 minutes
        const intervalId = setInterval(() => {
            checkToken();
        }, fithteenMinutes);

        return () => clearInterval(intervalId);
    }, []);

    async function onLogin(email: string, password: string){
        try {
            const deviceUniqueToken = await safeStorage.getUniqueDeviceId()
            // const notificationToken = await safeStorage.getNotificationToken()
            if(!deviceUniqueToken){
                return Alert.alert('Error', "No device token found. Please try again.")
            }
            // Call the login endpoint
            const response = await api.server.post('/user/login', {email, password, deviceUniqueToken})
            const token = response.data.token
            const refreshToken = response.data.refresh_token
            const user_id = response.data.user_id
            //Validate if user_id is the same as the one stored in the secure storage
            const storedUserId = await safeStorage.getUserId()
            if(storedUserId && storedUserId !== user_id){

            }

            // Save secure storage and MMKV values
            await safeStorage.setJWT(token)
            await safeStorage.setRefreshToken(refreshToken)
            await safeStorage.setUserId(user_id)
            await safeStorage.setEmail(email)
            await safeStorage.setDeviceOS(Platform.OS)
            MMKV.setUserId(user_id)
            MMKV.setToken(token)
            // Backup messages
            await backupMessages()
            // Set the token to the axios instance
            api.setTokenAuth(token)

            // Set the token to the state
            setAuthState({token, authenticated: true, user_id})
            router.navigate('/private/home')
        } catch (error) {
            if(error instanceof AxiosError){
                if(error.response?.status === 401){
                    return Alert.alert('Error', "Invalid credentials. Please try again.")
                }
                if(error.response?.status === 403){
                    console.log(error.response.data)
                    return Alert.alert('Error', "A new device is trying to login. Please confirm your email.")
                }
            }
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
                await safeStorage.setEmail(email)
                await safeStorage.setDeviceOS(Platform.OS)
                const deviceNotificationToken = await safeStorage.getNotificationToken()
                if(!deviceNotificationToken) await safeStorage.setNotificationToken(randomUUID())
                router.navigate('/confirmsignup')
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
                router.navigate('/login')
            }
        } catch (error) {
            Alert.alert('Error', "An error occurred while trying to confirm your account. Please try again.")
        }
    }

    async function onLogout(){
        await safeStorage.clearAll()
        // await safeStorage.clearUserId()
        MMKV.cleanAll()
        setAuthState({token: null, authenticated: false, user_id: null})

        router.navigate('/')
    }

    const values = {authState, onRegister, onLogin, isLoading, onConfirmSignUp, onLogout}

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}