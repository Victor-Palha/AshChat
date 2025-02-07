import { InputHTMLAttributes, ReactNode } from "react"
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    icon: ReactNode
}

export function Input({icon, ...rest}: InputProps){
    return (
        <div className="flex bg-white w-[300px] h-[40px] rounded-lg flex-row items-center px-2">
            <>
                {icon}
            </>
            <input
                className="w-full h-full opacity-75 p-4 placeholder:text-gray-700 text-gray-900 border-none focus:outline-none"
                {...rest}
            />
        </div>
    )
}