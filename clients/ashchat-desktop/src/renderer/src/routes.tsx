import { BrowserRouter } from 'react-router-dom';
import { Router } from '../../lib/electron-router-dom';
import { Route } from 'react-router-dom';

import { Welcome } from './screens/Welcome';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { ConfirmSignUp } from './screens/ConfirmSignup';
import { ForgotPassword } from './screens/ForgotPassword';
import { ResetPassword } from './screens/ResetPassword';
import { AuthContextProvider } from './contexts/auth/authContext';
import { Home } from './screens/Home';
import { ChatContextProvider } from './contexts/chat/chatContext';
import NewDevice from './screens/NewDevice';

export function AppRoutes() {
  return (
    <AuthContextProvider>
      <Router
        main={
            <>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/confirmsignup" element={<ConfirmSignUp />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
              <Route path="/newdevice" element={<NewDevice/>}/>
              {/* Private Routes */}
              <Route path="/home" element={
                <ChatContextProvider>
                    <Home />
                </ChatContextProvider>
              } />
            </>
        }
      />
    </AuthContextProvider>
  );
}