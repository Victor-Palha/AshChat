import { useNavigate } from "react-router-dom";
import { RedirectProps } from "../contexts/auth/authContext";

export function useRedirect(data: RedirectProps | void){
    const navigate = useNavigate()
    if(data){
        const [_state, url] = data
        navigate(url)
    }
}