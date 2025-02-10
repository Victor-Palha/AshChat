import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { CaretLeft, EnvelopeSimple } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/auth/authContext";
import { Link } from "react-router-dom";

export function ForgotPassword(){
    const [email, setEmail] = useState("");
    const {onForgotPassword} = useContext(AuthContext)
    async function handleSendCodeToEmail(){
        if (email.length < 3){
            return alert("Please enter a valid email address");
        }
        await onForgotPassword(email);
    }
    return ( 
        <div className="body flex flex-col flex-1 items-center justify-center">
            <Link to="/login" className="flex flex-row items-center gap-2 mb-10 text-purple-700">
                <CaretLeft size={24} className="text-purple-700" />
                <span>Back</span>
            </Link>
            <div className="items-center justify-center px-[45] mb-10">
                <p className="text-white font-bold text-lg mb-5">Forgot your password?</p>
                <p className="text-white italic">We’ll send a code to your email address to recover your account.</p>
            </div>

            <div className="flex-row justify-between px-5 gap-2 mb-10">
                <Input
                    icon={<EnvelopeSimple name="mailbox" size={24} color="black" />}
                    placeholder="Email"
                    type="email"
                    autoCapitalize="none"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />
            </div>
            <Button title="Send code" onClick={handleSendCodeToEmail}/>
        </div>
    )
}