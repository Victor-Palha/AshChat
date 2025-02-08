import { Router } from '../../lib/electron-router-dom'
import { Route } from 'react-router-dom'

import { Welcome } from './screens/Welcome'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'

export function Routes() {
  return (
    <Router
        main={
          <>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </>
        }
    />
  )
}