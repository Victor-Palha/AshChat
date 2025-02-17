import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/auth/authContext";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function NewDevice(){
    const navigate = useNavigate();
    const {onNewDevice} = useContext(AuthContext)

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

    async function handleConfirmNewDevice(){
        const codeValue = code.join('');
        const response = await onNewDevice(codeValue);
        if(response){
            const [_, url] = response
            navigate(url)
        }
    }
    return (
        <div className="body flex flex-col flex-1 pt-[62px] items-center justify-center">
            <div className="items-center justify-center px-[45] mb-10">
                <p className="text-white font-bold text-lg mb-5">Get your Code to allow new device</p>
                <span className="text-white italic">Please, enter the 6 digit code that send to your email address.</span>
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
            <Button title="Verify and Proceed" onClick={handleConfirmNewDevice}/>
        </div>
    )
}