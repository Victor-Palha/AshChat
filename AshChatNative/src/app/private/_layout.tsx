import { router, Stack } from 'expo-router';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '@/src/contexts/authContext';
import { Loading } from '@/src/components/Loading';
import { colors } from '@/src/styles/colors';
import { SocketProvider } from '@/src/contexts/socketContext';

export default function Layout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <PrivateRouter />
      </SocketProvider>
    </AuthProvider>
  )
}

export function PrivateRouter(){
  const { authState, isLoading } = useContext(AuthContext)
  const backgroundColor = colors.gray[700];
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Loading/>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!authState.authenticated) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    router.replace('/login');
    return
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack  screenOptions={{
      headerShown: false,
      contentStyle: {
          backgroundColor,
      }
    }}/>
  );
}