import { PencilSimpleLine, Plus, X, Check } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { SettingsViewModel } from "./settings-view-model";
import { useEffect, useRef, useState } from "react";

export function Settings() {
    const {
        userProfile,
        profilePicture,
        handleLogout,
        handleUpdateProfilePicture,
        handleChangeUsername,
        handleChangeDescription,
    } = SettingsViewModel();
    const [isNicknameDisabled, setIsNicknameDisabled] = useState(true);
    const [isAboutDisabled, setIsAboutDisabled] = useState(true);
    const [nickname, setNickname] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleImageClick () {
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    };

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0];
        if (file) {
            await handleUpdateProfilePicture(file);
        }
    };


    async function handleUpdateNickname() {
        if (!nickname) {
            alert("Please enter a name with more then 3 characters");
            return;
        }

        await handleChangeUsername(nickname);
        setIsNicknameDisabled(true);
    }

    async function handleUpdateDescription() {
        if (!description) {
            alert("Please enter a description with more then 0 characters and less then 150 characters");
            return;
        }
        handleChangeDescription(description);
        setIsAboutDisabled(true);
    }

    useEffect(() => {
        setNickname(userProfile?.nickname);
        setDescription(userProfile?.description);
    }, [userProfile])

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <div>
                    <img 
                        src={userProfile?.photo_url}
                        className="cursor-pointer rounded-full w-[30px] h-[30px] hover:scale-105 transition"
                    />
                </div>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-gray-700/70 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray-700 p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="text-xl font-semibold text-white mb-4">
                        Profile
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-300 mb-6">
                        Edit your profile information
                    </Dialog.Description>
                    <div className="flex justify-center mb-6">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div
                            className="relative rounded-full w-24 h-24 cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <img
                                className="rounded-full w-full h-full object-cover border-2 border-purple-700"
                                src={profilePicture}
                                alt="Foto de perfil"
                            />
                            {/* Overlay para indicar que a imagem é clicável */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-medium">Alterar</span>
                            </div>
                        </div>
                    </div>

                    {/* Input do Nickname */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-800 shadow-sm hover:shadow-md transition-shadow mb-4">
                        <input
                            className="bg-gray-800 inline-flex h-[35px] w-full flex-1 items-center justify-center text-[15px] leading-none text-white placeholder-gray-400 rounded-lg px-3 outline-none focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            disabled={isNicknameDisabled}
                            placeholder="Nickname"
                        />
                        <button
                            onClick={() => setIsNicknameDisabled(!isNicknameDisabled)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700"
                            aria-label={isNicknameDisabled ? "Editar nickname" : "Desabilitar edição"}
                        >
                            <PencilSimpleLine size={20} />
                        </button>
                        {!isNicknameDisabled && (
                            <button
                                onClick={handleUpdateNickname}
                                className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700"
                                aria-label="Limpar nickname"
                            >
                                <Check size={20} />
                            </button>
                        )}
                    </div>

                    {/* Input da Descrição */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-800 shadow-sm hover:shadow-md transition-shadow mb-6">
                        <textarea
                            className="bg-gray-800 inline-flex h-[35px] w-full flex-1 items-center justify-center text-[15px] leading-none text-white placeholder-gray-400 rounded-lg px-3 outline-none focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-8 max-h-28 p-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isAboutDisabled}
                            placeholder="Digite uma descrição sobre você"
                        />
                        <button
                            onClick={() => setIsAboutDisabled(!isAboutDisabled)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700"
                            aria-label={isAboutDisabled ? "Editar descrição" : "Desabilitar edição"}
                        >
                            <PencilSimpleLine size={20} />
                        </button>
                        {!isAboutDisabled && (
                            <span 
                                className={description?.length  && 150 - description?.length < 0 ? "text-red-500" : ""}
                            >
                                {description ? 150 - description?.length  : 150}
                            </span>
                        )}
                        {!isAboutDisabled && (
                            <button
                                onClick={handleUpdateDescription}
                                className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700"
                                aria-label="Limpar nickname"
                            >
                                <Check size={20} />
                            </button>
                        )}
                    </div>

                    {/* Botão de Logout */}
                    <div className="mt-6">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Botão de Fechar */}
                    <Dialog.Close asChild>
                        <button
                            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}