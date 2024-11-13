import { Stack } from 'expo-router';
import "../styles/global.css"

export default function RootLayout() {

  return (
    <Stack screenOptions={{
      headerShown: false,
      // contentStyle: {
      //     backgroundColor,
      // }
  }}/>
  )
}