import { Eye, EyeSlash, Lock } from "@phosphor-icons/react";
import { InputHTMLAttributes, useState } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
}
export function InputPassword({ ...rest }: InputProps){
    const [isPassVisible, setIsPassVisible] = useState(true);

    function handleShowPassword(){
        setIsPassVisible(!isPassVisible);
    }
    return (
        <div className="flex bg-white w-[300px] h-[40px] rounded-lg flex-row items-center px-2">
            <Lock name="lock" size={24} color="black" />
            <input
                className="w-full h-full focus:outline-none text-gray-900 opacity-75 p-4 placeholder:text-gray-700"
                type={isPassVisible ? "password" : "text"}
                {...rest}
            />
            <button onClick={handleShowPassword}>
                {
                    isPassVisible ? <EyeSlash name="eye-slash" size={24} color="black" /> : <Eye name="eye" size={24} color="black" />
                }
            </button>
        </div>
    )
}