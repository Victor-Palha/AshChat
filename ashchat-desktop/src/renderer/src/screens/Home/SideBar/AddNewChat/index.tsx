import { Plus, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";


export function AddNewChat() {
    return (
	<Dialog.Root>

		<Dialog.Trigger asChild>
            <button
                className="flex bg-purple-700 rounded-full w-[50px] h-[50px] items-center justify-center"
            >
                <Plus size={24} color="white" />
            </button>
		</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay className="fixed inset-0 bg-gray-700/70 data-[state=open]:animate-overlayShow" />
			<Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] focus:outline-none data-[state=open]:animate-contentShow bg-gray-700 shadow shadow-purple-700">
				<Dialog.Title className="m-0 text-[17px] font-medium text-mauve12 mb-5">
					Add new contact
				</Dialog.Title>
                <Dialog.Description className="text-[15px] text-gray-300 mb-5"></Dialog.Description>
				<fieldset className="mb-[15px] flex items-center gap-5">
					<input
						className="bg-gray-700 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-purple-700"
						id="tag_id"
                        placeholder="Enter user tag ID"
						defaultValue=""
					/>
				</fieldset>
				<div className="mt-[25px] flex justify-end">
					<Dialog.Close asChild>
						<button className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 outline-none outline-offset-1 hover:bg-green5 focus-visible:outline-2 focus-visible:outline-green6 select-none bg-purple-700 hover:scale-105 transition">
							Add
						</button>
					</Dialog.Close>
				</div>

				<Dialog.Close asChild>
					<button
						className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
						aria-label="Close"
					>
						<X size={20} />
					</button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
)
}