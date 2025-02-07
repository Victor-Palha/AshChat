import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    title: string;
}
export function Button({title, ...rest}: ButtonProps){
    return (
        <button className="bg-purple-700 py-[10px] w-[300px] rounded-md items-center shadow-lg" {...rest}>
            <p className="text-white font-bold">{title}</p>
        </button>
    )

}