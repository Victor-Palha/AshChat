import { Router } from '../../lib/electron-router-dom'
import { Route } from 'react-router-dom'

import { Welcome } from './screens/Welcome'

export function Routes() {
  return (
    <Router
        main={
            <Route path="/" element={<Welcome />} />
        }
    />
  )
}