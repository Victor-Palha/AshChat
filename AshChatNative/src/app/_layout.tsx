import { Stack } from 'expo-router';
import "../styles/global.css"
import { colors } from '../styles/colors';
import { StatusBar } from 'react-native';
import {useFonts, Kenia_400Regular} from "@expo-google-fonts/kenia"
import {Loading} from '../components/Loading';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kenia_400Regular
  })
  if(!fontsLoaded) return <Loading/>
  
  const backgroundColor = colors.gray[700];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
            backgroundColor,
        }
      }}/>
    </>
  )
}