import { useContext, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { AuthContext } from "../../contexts/auth/authContext";
import { useNavigate } from "react-router-dom";


export function ConfirmSignUp(){
    const navigate = useNavigate()
    const {onConfirmSignUp} = useContext(AuthContext)

    const [code, setCode] = useState(['', '', '', '', '', '']);
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

    async function handleConfirmSignUp(){
        const codeValue = code.join('');
        try {
            const response = await onConfirmSignUp(codeValue);
            if(response){
                const [_, url] = response
                navigate(url)
            }
        } catch (error) {
            return
        }
    }

    return (
        <div className="body flex flex-col flex-1 pt-[62px] items-center justify-center">
            <div className="items-center justify-center px-[45] mb-10">
                <p className="text-white font-bold text-lg mb-5">Get your Code</p>
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
            <Button title="Verify and Proceed" onClick={handleConfirmSignUp}/>
        </div>
    )
}