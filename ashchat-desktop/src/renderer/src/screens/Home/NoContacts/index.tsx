import imageNotFound from '../../../assets/nowhere.png';

export function NoContacts(){
    return (
        <div className="flex flex-col items-center justify-center pt-[30%]">
            <img
                className="rounded-full w-100 h-100"
                src={imageNotFound}
            />
            <p className="text-white font-semibold italic text-md mt-[-40] text-center">Hmm... You seen to be lost! Try to connect to someone!</p>
        </div>
    )
}