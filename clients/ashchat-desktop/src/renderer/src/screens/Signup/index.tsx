import { useContext, useState } from "react";
import { Input } from "../../components/Input";
import { InputPassword } from "../../components/InputPassword";
import { languages } from '../../constants/languages';
import { Button } from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeSimple, User } from "@phosphor-icons/react";
import { AuthContext } from "../../contexts/auth/authContext";
import { useValidate } from '../../hooks/useValidate'

type Languages = typeof languages[0];

export function Signup(){
    useValidate();
    const navigate = useNavigate()
    const {onRegister} = useContext(AuthContext);

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<Languages | null>(null);

    function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>){
        const selected = languages.find((lang) => lang.value === event.target.value);
        setSelectedLanguage(selected || null);
    };

    async function handleRegister(){
        if(password !== confirmPassword){
            alert("Passwords do not match")
            return
        }
        if(!selectedLanguage){
            alert("Please select a language")
            return
        }
        if(!nickname || !email || !password){
            alert("Please fill all the fields")
            return
        }

        try {
            const response = await onRegister(email, password, nickname, selectedLanguage.value)
            if(response){
                const [_, url] = response
                navigate(url)
            }
        } catch (error) {
            console.log(error)
            alert("An error occurred")
        }
    }

    return (
        <div
            className="body flex flex-col items-center justify-center text-white"
        >
            <div className="gap-2">
                <p className="font-bold text-white text-lg">Create an account!</p>
                <p className="italic text-white">
                    We'll send a code to your email address to confirm your identity.
                </p>
            </div>

            <div className="flex flex-col gap-3 mt-5 mb-7">
                <Input 
                    placeholder="Username" 
                    icon={<User name="mailbox" size={24} color="black" />}
                    value={nickname} onChange={(e)=>setNickname(e.target.value)}
                />
                <Input 
                    placeholder="Email" 
                    icon={<EnvelopeSimple name="mailbox" size={24} color="black" />}
                    autoCapitalize="none" 
                    autoComplete="off"
                    value={email} onChange={(e)=>setEmail(e.target.value)}
                />
                <InputPassword placeholder="Password"
                    value={password} onChange={(e)=>setPassword(e.target.value)}
                />
                <InputPassword placeholder="Confirm Password"
                    value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}
                />
                {/* Language Dropdown */}
                <div className="relative">
                    <select
                        onChange={handleSelectChange}
                        className="border w-full border-gray-300 p-3 rounded-md bg-white text-black"
                        value={selectedLanguage?.value || ""}
                    >
                        <option value="" disabled>
                        Select a language
                        </option>
                        {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
            <Button title="Sign up"  onClick={handleRegister}/>
            <div className="text-center items-center mt-3">
                <Link to="/login" className="text-sm font-semibold text-purple-700 mb-4">
                    Already have a account? Sign in
                </Link>
            </div>
        </div>
    )
}
