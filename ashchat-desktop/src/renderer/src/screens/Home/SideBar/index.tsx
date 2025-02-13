import { Plus } from "@phosphor-icons/react"

type SideBarProps = {
    handleOpenModal: () => void
    userPhotoProfile: string | undefined
}
export function SideBar(data: SideBarProps){
    return (
        <aside className="flex flex-col p-5 gap-5 bg-gray-900 justify-between">
            <button
                className="flex bg-purple-700 rounded-full w-[50px] h-[50px] items-center justify-center"
                onClick={data.handleOpenModal}
            >
                <Plus size={24} color="white" />
            </button>
            <div>
                <img 
                    src={data.userPhotoProfile}
                    className="cursor-pointer rounded-full w-[50px] h-[50px] hover:scale-105 transition"
                />
            </div>
        </aside>
    )
}