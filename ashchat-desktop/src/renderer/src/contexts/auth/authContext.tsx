import { createContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { AuthModelContext } from "./auth-model-context";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "../../constants/api-urls";

type RedirectProps = [boolean, string];

type AuthState = {
    user_id: string | null,
    authenticated: boolean | null
}
interface AuthProps {
    authState: AuthState,
    isLoading: boolean,
    onRegister: (email: string, password: string, nickname: string, preferredLanguage: string) => Promise<RedirectProps | void>,
    onLogin: (email: string, password: string) => Promise<RedirectProps | void>,
    onConfirmSignUp: (emailCode: string) => Promise<RedirectProps | void>,
    onNewDevice(emailCode: string): Promise<RedirectProps | void>,
    onLogout(): Promise<RedirectProps>,
    onForgotPassword(email: string): Promise<RedirectProps | void>,
    onResetPassword(emailCode: string, newPassword: string): Promise<RedirectProps | void>
}

export const AuthContext = createContext<AuthProps>({} as AuthProps);

export function AuthContextProvider({children}: {children: React.ReactNode}){
    const [authState, setAuthState] = useState<AuthState>({authenticated: null, user_id: null});
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingUserIdentity, setIsCheckingUserIdentity] = useState(false);

    async function validateRefreshTokenToken(refresh_token: string): Promise<boolean> {
        const {deviceTokenId, authAPI} = AuthModelContext.getStoredTokens();
        try {
            authAPI.setTokenAuth(refresh_token);
            authAPI.setHeader("device_token", deviceTokenId);
    
            const response = await authAPI.server.get("/user/refresh-token");
    
            if (response.status === 401) {
                console.log('Token expired');
                AuthModelContext.deleteStoredTokens();
                return false;
            }
    
            if (response.status !== 200) {
                return false;
            }
    
            const { data } = response.data;
            AuthModelContext.validatedRefreshToken({
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
        const {refresh_token, user_id} = AuthModelContext.getStoredTokens();
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

    async function getBackupFromServer(jwtToken: string, deviceToken: string){
        const {chatAPI} = AuthModelContext.getStoredTokens();
        chatAPI.setTokenAuth(jwtToken);
        chatAPI.setHeader('device_token', deviceToken);
        const response = await chatAPI.server.get("/chats")
        const {chats} = response.data as {chats: BackupMessagesDTO[] | []}
        if(chats.length === 0) return null
        await window.chatApi.backup(chats)
    }

    async function onLogin(email: string, password: string): Promise<RedirectProps | void> {
        const {deviceTokenId, authAPI} = AuthModelContext.getStoredTokens();
        try {
            if(!deviceTokenId){
                return alert("No device token found. Please try again.");
            }
            const responseAuthServer = await authAPI.server.post('/user/signin', {
                email, 
                password,
                deviceTokenId
            })
            const {token, refresh_token, user_id} = responseAuthServer.data.data;
            await saveUserProfile(token, deviceTokenId);
            const os = "Electron";
            AuthModelContext.persistenceProfileData({
                token, 
                refresh_token, 
                user_id, 
                email, 
                platform: os
            });
            await getBackupFromServer(token, deviceTokenId)
            setAuthState({authenticated: true, user_id});
            // router('/private/home')
            return [true, '/home'];
        } catch (error) {
            if(error instanceof AxiosError){
                if(error.response?.status === 401){
                    return alert("Invalid credentials. Please try again.")
                }
                if(error.response?.status === 403){
                    console.log(error.response.data)
                    await AuthModelContext.newDeviceTryingToLogin(error.response.data.data.token);
                    alert("A new device is trying to login. Please confirm your email.");
                    // navigate('/newdevice');
                    return [false, '/newdevice'];
                }
            }
            else{
                alert("An error occurred while trying to login. Please try again.")
            }
        }
    }

    async function onRegister(email: string, password: string, nickname: string, preferredLanguage: string): Promise<RedirectProps | void> {
        const {deviceTokenId, authAPI} = AuthModelContext.getStoredTokens();
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
                alert("You have successfully registered. Please check your email to confirm your account.")
                AuthModelContext.persistenceAfterRegister({email, deviceTokenId})
                // navigate('/confirmsignup')
                return [true, '/confirmsignup'];
            }
            
        } catch (error) {
            alert("An error occurred while trying to register. Please try again.")
        }

    }

    async function onConfirmSignUp(emailCode: string): Promise<RedirectProps | void> {
        const {deviceTokenId, user_email, deviceNotificationToken, authAPI} = AuthModelContext.getStoredTokens();
        try {
            if(!user_email || !deviceTokenId){
                alert("An error occurred while trying to confirm your account. Please try again.")
            }
            const os = "Electron";
            const data = {
                email: user_email, 
                emailCode, 
                deviceOS: os, 
                deviceTokenId, 
                deviceNotificationToken
            }
            const response = await authAPI.server.post('/user/confirm-email', data)

            if(response.status === 201){
                alert("You have successfully confirmed your account. Please login to continue.")
                // navigate('/login')
                return [true, '/login'];
            }
        } catch (error) {
            alert("An error occurred while trying to confirm your account. Please try again.")
        }
    }

    async function onNewDevice(emailCode: string):  Promise<RedirectProps | void> {
        const temporaryToken = AuthModelContext.getTemporaryToken();
        if(!temporaryToken) {
            alert("An error occurred while trying to confirm your new device. Please try again.")
            // navigate('/login')
            return [false, '/login'];
        }
        const {deviceTokenId, deviceNotificationToken, authAPI} = AuthModelContext.getStoredTokens();
        try{
            const os = "Electron";
            const response = await authAPI.server.post('/user/confirm-new-device', {
                emailCode, 
                deviceOS: os, 
                deviceTokenId, 
                deviceNotificationToken
            }, {
                headers: {
                    Authorization: `Bearer ${temporaryToken}`
                }
            })
            if(response.status === 204){
                alert("You have successfully confirmed your new device. Please login to continue.")
                // navigate('/login')
                return [true, '/login'];
            }
        }catch(error) {
            if(error instanceof AxiosError){
                alert(error.response?.data.message)
            }else {
                alert("An error occurred while trying to confirm your new device. Please try again.")
            }
            // navigate('/login')
            return [false, '/login'];
        }
            
    }

    async function onForgotPassword(email: string):  Promise<RedirectProps | void> {
        const {authAPI} = AuthModelContext.getStoredTokens();
        try{
            const response = await authAPI.server.post("/user/password", {
                email
            })
            if(response.status == 202){
                const {token} = response.data.data;
                AuthModelContext.newDeviceTryingToLogin(token);
                alert("An email has been sent to you with instructions to reset your password.")
                return [true, '/resetpassword'];
                // navigate("/resetpassword");

            }
        }
        catch(error){
            if(error instanceof AxiosError){
                if(error.status == 404){
                    return alert("Email not found. Please try again.")
                }
            }
            return alert("An error occurred while trying to send the email. Please try again.")
        }
    }

    async function onResetPassword(emailCode: string, newPassword: string): Promise<RedirectProps | void> {
        const {authAPI} = AuthModelContext.getStoredTokens();
        const temporaryToken = AuthModelContext.getTemporaryToken();
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
                alert("Your password has been successfully reset. Please login to continue.")
                // navigate("/login");
                return [true, '/login'];
            }
        }
        catch(error){
            if(error instanceof AxiosError){
                if(error.status == 404){
                    return alert("Email not found. Please try again.")
                }
                if(error.status == 400){
                    return alert("Invalid code. Please try again.")
                }
            }
            return alert("An error occurred while trying to reset your password. Please try again.")
        }
    }
    
    async function onLogout(): Promise<RedirectProps> {
        await AuthModelContext.deleteStoredTokens();
        await window.userApi.logout()
        setAuthState({authenticated: false, user_id: null})
        // Need to leave all channels and unsubscribe from all push notifications
        // navigate('/')
        return [true, '/'];
    }

    async function saveUserProfile(jwt_token: string, deviceTokenId: string){
        const {chatAPI} = AuthModelContext.getStoredTokens();
        if(!jwt_token || !deviceTokenId) return;
        chatAPI.setTokenAuth(jwt_token);
        chatAPI.setHeader("device_token", deviceTokenId);
        try {
            const response = await chatAPI.server.get("/user");
            if(response.status == 200){
                const {nickname, description, photo_url, preferred_language, tag_user_id} = response.data.user;
                // console.log(response.data.user)
                await window.userApi.addUser({
                    nickname,
                    description,
                    photo_url: API_URLS.STATIC_SERVICE+photo_url,
                    preferred_language,
                    tag_user_id
                })
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