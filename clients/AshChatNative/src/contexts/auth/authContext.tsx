import { createContext, useEffect, useState } from "react";
import { AuthModelContext } from "./authModelContext";
import { Alert, Platform } from "react-native";
import { BackupChat } from "@/src/utils/backupMessages";
import { router } from "expo-router";
import { AxiosError } from "axios";

type AuthState = {
    user_id: string | null,
    authenticated: boolean | null
}
interface AuthProps {
    authState: AuthState,
    isLoading: boolean,
    onRegister: (email: string, password: string, nickname: string, preferredLanguage: string) => Promise<any>,
    onLogin: (email: string, password: string) => Promise<any>,
    onConfirmSignUp: (emailCode: string) => Promise<any>,
    onNewDevice(emailCode: string): Promise<void>,
    onLogout(): Promise<void>,
    onForgotPassword(email: string): Promise<void>,
    onResetPassword(emailCode: string, newPassword: string): Promise<void>
}

export const AuthContext = createContext<AuthProps>({} as AuthProps);

export function AuthContextProvider({children}: {children: React.ReactNode}){
    const [authState, setAuthState] = useState<AuthState>({authenticated: null, user_id: null});
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingUserIdentity, setIsCheckingUserIdentity] = useState(false);

    async function validateRefreshTokenToken(refresh_token: string): Promise<boolean> {
        const {deviceTokenId, authAPI} = await AuthModelContext.getStoredTokens();
        try {
            authAPI.setTokenAuth(refresh_token);
            authAPI.setHeader("device_token", deviceTokenId);
    
            const response = await authAPI.server.get("/user/refresh-token");
    
            if (response.status === 401) {
                console.log('Token expired');
                await AuthModelContext.deleteStoredTokens();
                return false;
            }
    
            if (response.status !== 200) {
                return false;
            }
    
            const { data } = response.data;
            await AuthModelContext.validatedRefreshToken({
                token: data.token,
                refresh_token: data.refresh_token
            })
            authAPI.setTokenAuth(data.refresh_token);
    
            return true;
        } catch (error) {
            console.error("Error validating token:", error);
            return false;
        }
    }

    async function checkingUserIdentifyByRefreshToken(): Promise<void> {
        const {refresh_token, user_id} = await AuthModelContext.getStoredTokens();
        if (isCheckingUserIdentity) return;
        if (authState.authenticated === false) return;
        setIsCheckingUserIdentity(true);

        if (refresh_token) {
            const isValid = await validateRefreshTokenToken(refresh_token);
            if (!isValid) {
                setAuthState({authenticated: false, user_id: null });
                setIsCheckingUserIdentity(false);
                return;
            }
            setAuthState({authenticated: true, user_id });
        } else {
            setAuthState({authenticated: false, user_id: null });
        }
        setIsCheckingUserIdentity(false);
    }

    async function onLogin(email: string, password: string){
        const {deviceTokenId, authAPI} = await AuthModelContext.getStoredTokens();
        try {
            if(!deviceTokenId){
                return Alert.alert('Error', "No device token found. Please try again.");
            }
            const responseAuthServer = await authAPI.server.post('/user/signin', {
                email, 
                password, 
                deviceTokenId
            })
            const {token, refresh_token, user_id} = responseAuthServer.data.data;
            await saveUserProfile(token, deviceTokenId);
            await AuthModelContext.persistenceProfileData({
                token, 
                refresh_token, 
                user_id, 
                email, 
                platform: Platform.OS
            });
            new BackupChat().backupMessages();
            setAuthState({authenticated: true, user_id});
            router.replace('/private/home')
        } catch (error) {
            if(error instanceof AxiosError){
                if(error.response?.status === 401){
                    return Alert.alert('Error', "Invalid credentials. Please try again.")
                }
                if(error.response?.status === 403){
                    console.log(deviceTokenId)
                    console.log(error.response.data)
                    await AuthModelContext.newDeviceTryingToLogin(error.response.data.data.token);
                    Alert.alert('Error', "A new device is trying to login. Please confirm your email.");
                    router.replace('/newdevice');
                    return
                }
            }
            else{
                Alert.alert('Error', "An error occurred while trying to login. Please try again.")
            }
        }
    }

    async function onRegister(email: string, password: string, nickname: string, preferredLanguage: string){
        const {deviceTokenId, authAPI} = await AuthModelContext.getStoredTokens();
        try {
            if(!deviceTokenId){
                return 
            }
            const response = await authAPI.server.post('/user/signup', {
                email, 
                password, 
                name: nickname, 
                preferredLanguage,
            })
            if(response.status === 202){
                Alert.alert('Success', "You have successfully registered. Please check your email to confirm your account.")
                await AuthModelContext.persistenceAfterRegister({email, deviceTokenId})
                router.navigate('/confirmsignup')
            }
            
        } catch (error) {
            Alert.alert('Error', "An error occurred while trying to register. Please try again.")
        }

    }

    async function onConfirmSignUp(emailCode: string){
        const {deviceTokenId, user_email, deviceNotificationToken, authAPI} = await AuthModelContext.getStoredTokens();
        try {
            if(!user_email || !deviceTokenId){
                Alert.alert('Error', "An error occurred while trying to confirm your account. Please try again.")
            }

            const response = await authAPI.server.post('/user/confirm-email', {
                email: user_email, 
                emailCode, 
                deviceOS: Platform.OS, 
                deviceTokenId, 
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

    async function onNewDevice(emailCode: string){
        const temporaryToken = await AuthModelContext.getTemporaryToken();
        if(!temporaryToken) {
            Alert.alert('Error', "An error occurred while trying to confirm your new device. Please try again.")
            router.replace('/login')
            return
        }
        const {deviceTokenId, deviceNotificationToken, authAPI} = await AuthModelContext.getStoredTokens();
        try{
            const response = await authAPI.server.post('/user/confirm-new-device', {
                emailCode, 
                deviceOS: Platform.OS, 
                deviceTokenId, 
                deviceNotificationToken
            }, {
                headers: {
                    Authorization: `Bearer ${temporaryToken}`
                }
            })
            if(response.status === 204){
                Alert.alert('Success', "You have successfully confirmed your new device. Please login to continue.")
                router.replace('/login')
            }
        }catch(error) {
            if(error instanceof AxiosError){
                Alert.alert('Error', error.response?.data.message)
            }else {
                Alert.alert('Error', "An error occurred while trying to confirm your new device. Please try again.")
            }
            router.replace('/login')
            return
        }
            
    }
    async function onForgotPassword(email: string){
        const {authAPI} = await AuthModelContext.getStoredTokens();
        try{
            const response = await authAPI.server.post("/user/password", {
                email
            })
            if(response.status == 202){
                const {token} = response.data.data;
                await AuthModelContext.newDeviceTryingToLogin(token);
                Alert.alert('Success', "An email has been sent to you with instructions to reset your password.")
                return router.push("/resetpassword");
            }
        }
        catch(error){
            if(error instanceof AxiosError){
                if(error.status == 404){
                    return Alert.alert('Error', "Email not found. Please try again.")
                }
            }
            return Alert.alert('Error', "An error occurred while trying to send the email. Please try again.")
        }
    }
    async function onResetPassword(emailCode: string, newPassword: string){
        const {authAPI} = await AuthModelContext.getStoredTokens();
        const temporaryToken = await AuthModelContext.getTemporaryToken();
        try{
            const response = await authAPI.server.patch("/user/password", {
                emailCode,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${temporaryToken}`
                }
            })
            if (response.status == 200){
                Alert.alert('Success', "Your password has been successfully reset. Please login to continue.")
                return router.replace("/login");
            }
        }
        catch(error){
            if(error instanceof AxiosError){
                if(error.status == 404){
                    return Alert.alert('Error', "Email not found. Please try again.")
                }
                if(error.status == 400){
                    return Alert.alert('Error', "Invalid code. Please try again.")
                }
            }
            return Alert.alert('Error', "An error occurred while trying to reset your password. Please try again.")
        }
    }
    async function onLogout(){
        await AuthModelContext.deleteStoredTokens();
        setAuthState({authenticated: false, user_id: null})
        // Need to leave all channels and unsubscribe from all push notifications
        

        router.navigate('/')
    }

    async function saveUserProfile(jwt_token: string, deviceTokenId: string){
        const {chatAPI} = await AuthModelContext.getStoredTokens();
        if(!jwt_token || !deviceTokenId) return;
        chatAPI.setTokenAuth(jwt_token);
        chatAPI.setHeader("device_token", deviceTokenId);
        try {
            const response = await chatAPI.server.get("/user");
            if(response.status == 200){
                const {nickname, description, photo_url, preferred_language, tag_user_id} = response.data.user;
                // console.log(response.data.user)
                await AuthModelContext.saveUserProfile({
                    nickname,
                    description,
                    photo_url,
                    preferred_language,
                    tag_user_id
                });
            }
            // console.log(response.data)
        } catch (error) {
            console.log("getUserProfile error");
            console.log(error);
        }
    }

    useEffect(() => {
        checkingUserIdentifyByRefreshToken()
        .finally(() => {
            setIsLoading(false);
        });
        
        const minute = 60 * 1000; // 1 min
        const fithteenMinutes = minute * 15; // 15 minutes
        const intervalId = setInterval(() => {
            checkingUserIdentifyByRefreshToken();
        }, fithteenMinutes);

        return () => clearInterval(intervalId);
    }, []);

    const values = {
        authState, 
        isLoading, 
        onRegister, 
        onLogin, 
        onConfirmSignUp,
        onNewDevice,
        onLogout,
        onForgotPassword,
        onResetPassword
    }

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}