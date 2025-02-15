import { Plus } from "@phosphor-icons/react"
import { AddNewChat } from "./AddNewChat"
import { Settings } from "./Settings"

type SideBarProps = {
    userPhotoProfile: string | undefined
}
export function SideBar(data: SideBarProps){
    return (
        <aside className="flex flex-col p-5 gap-5 bg-gray-900 justify-between">
            <AddNewChat/>
            <Settings/>
        </aside>
    )
}