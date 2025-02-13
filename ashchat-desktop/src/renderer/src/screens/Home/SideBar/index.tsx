import { Plus } from "@phosphor-icons/react"

type SideBarProps = {
    handleOpenModal: () => void
}
export function SideBar(data: SideBarProps){
    return (
        <aside className="flex flex-col p-5 gap-5 bg-gray-900">
            <img 
                src="http://localhost:3006/files/04a76336-3571-4680-a55a-ad6ee5dfff62.jpg" 
                className="cursor-pointer rounded-full w-[50px] h-[50px] hover:scale-105 transition"
            />
            <button
                className="flex bg-purple-700 rounded-full w-[50px] h-[50px] items-center justify-center"
                onClick={data.handleOpenModal}
            >
                <Plus size={24} color="white" />
            </button>
        </aside>
    )
}