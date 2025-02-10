import { BrowserRouter } from 'react-router-dom'
import { Router } from '../../lib/electron-router-dom'
import { Route } from 'react-router-dom'

import { Welcome } from './screens/Welcome'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { ConfirmSignUp } from './screens/ConfirmSignup'
import { ForgotPassword } from './screens/ForgotPassword'
import { ResetPassword } from './screens/ResetPassword'

export function AppRoutes() {
  return (
      <Router
        main={
            <>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/confirmsignup" element={<ConfirmSignUp />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
            </>
        }
      />
  )
}
