import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../contexts/auth/authContext";
import { UserProfilePropsDTO } from "main/persistence/DTO/UserProfilePropsDTO";
import { PhoenixAPIClient } from "../../../../lib/api/phoenix-api-client";
import LocalStoragePersistence from "../../../../lib/local-storage-persistence";
import { useNavigate } from "react-router-dom";

export function SettingsViewModel() {
    const navigate = useNavigate()
    const {onLogout} = useContext(AuthContext)
    const [userProfile, setUserProfile] = useState<UserProfilePropsDTO | null>(null)

    function connectToApi(){
        const api = PhoenixAPIClient
        const token = LocalStoragePersistence.getJWT()
        const device_token = LocalStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return

        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)

        return api
    }

    async function handleGetUserProfile(){
        const profile = await window.userApi.getUser();
        if(profile){
            setUserProfile(profile);
        }
    }

    async function handleUpdateUserProfile(profile: UserProfilePropsDTO){
        setUserProfile(profile);
        await window.userApi.updateUser(profile);
    }


    async function handleUpdateProfilePicture(selectedFile: File){
        if(!selectedFile) {
            return;
        }
        const api = connectToApi();
        if(!api) return

        const formData = new FormData();
        formData.append("photo", selectedFile);
        try {
            const responseUpload = await api.server.patch("/user/photo", formData)
            if(responseUpload.status == 200){
                const {url} = responseUpload.data
                const newProfile: UserProfilePropsDTO = {
                    ...userProfile,
                    photo_url: url
                } as UserProfilePropsDTO
                console.log(newProfile)
                handleUpdateUserProfile(newProfile)
            }
        } catch (error) {
            console.log(error)
            alert("An error occurred while uploading the photo")
        }
    };

    async function handleChangeUsername(newName: string) {
        const api = connectToApi();
        if(!api) return

        if(newName.length > 3){
            const response = await api.server.patch("/user/nickname/", {
                nickname: newName
            })

            if(response.status == 200){
                const newProfile: UserProfilePropsDTO = {
                    ...userProfile,
                    nickname: newName
                } as UserProfilePropsDTO
                
                handleUpdateUserProfile(newProfile)
            }else{
                alert("An error occurred while creating the chat")
            }
        }else{
            alert("Please enter a name with more then 3 characters")
        }
    }

    async function handleChangeDescription(newDescription: string) {
        const api = connectToApi();
        if(!api) return
        
        if(newDescription.length > 0 && newDescription.length <= 150){
            const response = await api.server.patch("/user/description/", {
                description: newDescription
            })

            if(response.status == 200){
                const newProfile: UserProfilePropsDTO = {
                    ...userProfile,
                    description: newDescription
                } as UserProfilePropsDTO
                
                handleUpdateUserProfile(newProfile)
            }else{
                alert("An error occurred while creating the chat")
            }
        }else{
            alert("Please enter a description with more then 0 characters and less then 150 characters")
        }
    }

    async function handleLogout() {
        const logout = confirm("Are you sure you want to logout?")
        if(logout){
            const [_, url] = await onLogout()
            navigate(url)
        }
    }

    useEffect(()=>{
        handleGetUserProfile()
    },[])

    return {
        handleUpdateProfilePicture,
        handleChangeUsername,
        handleChangeDescription,
        handleLogout,
        userProfile,
        profilePicture: userProfile?.photo_url
    }
}