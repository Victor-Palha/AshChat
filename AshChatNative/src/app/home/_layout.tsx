import { Text } from 'react-native';
import { Redirect, router, Stack } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/src/contexts/authContext';
import { Loading } from '@/src/components/Loading';
import { colors } from '@/src/styles/colors';

export default function AppLayout() {
  const { authState, isLoading } = useContext(AuthContext)
  const backgroundColor = colors.gray[700];
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Loading/>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!authState.authenticated) {
    console.log(authState)
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    router.replace('/login');
    return
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack  screenOptions={{
    headerShown: false,
    contentStyle: {
        backgroundColor,
    }
  }}/>;
}
