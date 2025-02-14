import { Plus } from "@phosphor-icons/react"
import { AddNewChat } from "./AddNewChat"

type SideBarProps = {
    userPhotoProfile: string | undefined
}
export function SideBar(data: SideBarProps){
    return (
        <aside className="flex flex-col p-5 gap-5 bg-gray-900 justify-between">
            <AddNewChat/>
            <div>
                <img 
                    src={data.userPhotoProfile}
                    className="cursor-pointer rounded-full w-[30px] h-[30px] hover:scale-105 transition"
                />
            </div>
        </aside>
    )
}