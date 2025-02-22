import { EnvelopeSimple } from '@phosphor-icons/react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { Input } from '../../components/Input'
import ashChatLogo from '../../assets/logo.png'
import { InputPassword } from '../../components/InputPassword';
import { Button } from '../../components/Button';
import { AuthContext } from '../../contexts/auth/authContext';
import { useValidate } from '../../hooks/useValidate'
import { useRedirect } from '../../hooks/useRedirect';

export function Login(){
    useValidate();
    const {onLogin} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(){
        setIsLoading(true)
        const response = await onLogin(email, password);
        useRedirect(response)
        setIsLoading(false)
    }

    return (
        <main
            className="body flex flex-col items-center justify-center text-white"
        >
            <div className="items-center justify-center mb-[25px]">
                <img alt="logo" className="logo" src={ashChatLogo} />
                <h1 className="text-5xl text-white font-kenia">AshChat</h1>
            </div>

            <div className="flex flex-col gap-3">
                <Input
                    placeholder="Email" 
                    icon={<EnvelopeSimple name="mailbox" size={24} color="black" />}
                    autoCapitalize="none"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />
                <InputPassword
                    placeholder="Password"
                    autoCapitalize="none"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <Link to="/forgotpassword" className="text-sm font-semibold text-purple-700 mb-4">Forgot you password? Click here!</Link>
                <Button title="Sign in" onClick={handleLogin} isLoading={isLoading}/>

                <div className="text-center items-center mt-2">
                    <Link to="/signup" className="text-sm font-semibold text-purple-700 mb-4">
                    Don’t have a account? Sign Up!
                    </Link>
                </div>
            </div>
        </main>
    )
}