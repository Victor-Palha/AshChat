import imageNotFound from '../../../assets/nowhere.png';

export function NoContacts(){
    return (
        <div className="
            flex 
            flex-col 
            items-center 
            justify-center 
            animate-pulse
            group
        ">
            <img
                className="rounded-full w-100 h-100 group-hover:animate-rotate-shake"
                src={imageNotFound}
            />
            <p className="text-white font-semibold italic text-md mt-[-40] text-center">Hmm... You seen to be lost! Try to connect to someone!</p>
        </div>
    )
}