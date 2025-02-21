import { AddNewChat } from "./AddNewChat"
import { Settings } from "./Settings"

export function SideBar(){
    return (
        <aside className="flex flex-col p-5 gap-5 bg-gray-900 justify-between">
            <AddNewChat/>
            <Settings/>
        </aside>
    )
}