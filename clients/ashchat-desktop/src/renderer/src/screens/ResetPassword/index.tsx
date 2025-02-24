import { useContext, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { InputPassword } from "../../components/InputPassword";
import { AuthContext } from "../../contexts/auth/authContext";
import { useValidate } from '../../hooks/useValidate'
import { useRedirect } from "../../hooks/useRedirect";

export function ResetPassword(){
    useValidate();
    const {onResetPassword} = useContext(AuthContext)

    const [isLoading, setIsLoading] = useState(false)
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    function handleChange(text: string, index: number) {
        const newCode = [...code];
        newCode[index] = text;
    
        setCode(newCode);
    
        // Move to the next input if a digit is entered
        if (text && index < inputs.current.length - 1) {
            inputs.current[index + 1]?.focus();
        }
    
        // Move to the previous input if the field is empty and backspace was pressed
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    async function handleConfirmNewDevice(){
        const codeValue = code.join('');
        if (newPassword.length < 6 || newPassword.length > 20){
            return alert("Password must be between 6 and 20 characters");
        }
        if (newPassword !== confirmPassword){
            return alert("Passwords do not match");
        }
        setIsLoading(true)
        const response = await onResetPassword(codeValue, newPassword);
        useRedirect(response)
        setIsLoading(false)
    }

    return (
        <div className="body flex flex-col items-center justify-center">
        <div className="items-center justify-center px-[45] mb-10">
            <p className="text-white font-bold text-lg mb-5">Get your Code to reset your password</p>
            <p className="text-white italic">Please, enter the 6 digit code that send to your email address.</p>
        </div>

        <div className="flex flex-row justify-between px-5 gap-2 mb-10">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={(input) => (inputs.current[index] = input)}
                    className="w-12 h-12 border border-gray-300 rounded-lg text-3xl text-center bg-white text-gray-800"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    type="number"
                    maxLength={1}
                />
            ))}
        </div>
        <div className="flex flex-col px-5 gap-2 mb-10">
            <InputPassword
                placeholder="New password"
                autoCapitalize="none"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
            />
            <InputPassword
                placeholder="Confirm password"
                autoCapitalize="none"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
            />
        </div>
        <Button title="Verify and Proceed" onClick={handleConfirmNewDevice} isLoading={isLoading}/>
    </div>
    )
}