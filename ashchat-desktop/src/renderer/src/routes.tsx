import { BrowserRouter } from 'react-router-dom'
import { Router } from '../../lib/electron-router-dom'
import { Route } from 'react-router-dom'

import { Welcome } from './screens/Welcome'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { ConfirmSignUp } from './screens/ConfirmSignup'

export function AppRoutes() {
  return (
      <Router
        main={
            <>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/confirmsignup" element={<ConfirmSignUp />} />
            </>
        }
      />
  )
}
