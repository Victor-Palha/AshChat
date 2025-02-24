import { SpinnerGap } from "@phosphor-icons/react";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    title: string;
    isLoading?: boolean
}
export function Button({title, isLoading = false, ...rest}: ButtonProps){
    return (
        <button 
            className={`bg-purple-700 py-[10px] w-[300px] rounded-md items-center shadow-lg ${
                isLoading ? 'cursor-wait' : 'cursor-pointer'
            }`}
            disabled={isLoading}
            {...rest}
        >
            {isLoading ? (
                <div className="py-2">
                    <SpinnerGap size={20} className="animate-spin mx-auto"/>
                </div>
            ) : (
                <p className="text-white font-bold">{title}</p>
            )}
        </button>
    )

}