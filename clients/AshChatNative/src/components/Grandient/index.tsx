import { colors } from "@/src/styles/colors";
import { LinearGradient } from "expo-linear-gradient";

export function Gradient(){
    return (
        <LinearGradient
            colors={[colors.gray[700], colors.gray[900]]}
            className="absolute flex-1 h-full w-full"
            // style={{
            //     position: 'absolute',
            //     left: 0,
            //     right: 0,
            //     top: 0,
            //     height: "100%",
            // }}
        />
    )
}