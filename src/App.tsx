import './styles/main.scss'

import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useAppDispatch } from './app/hooks'
import { refreshToken } from './features/Auth/Auth.service'
import { ConfirmSignUp } from './pages/ConfirmSignUp/ConfirmSignUp'
import { ForgotPassword } from './pages/ForgotPassword/ForgotPassword'
import Private from './pages/Private/Private'
import { ResetPassword } from './pages/ResetPassword/ResetPassword'
import { SignIn } from './pages/SignIn/SignIn'
import { SignOut } from './pages/SignOut/SignOut'
import { SignUp } from './pages/SignUp/SignUp'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(refreshToken())
  }, [dispatch])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route index element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/confirm" element={<ConfirmSignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sign-out" element={<SignOut />} />

          {/* Private route */}
          <Route path="/private" element={<Private />} />

          {/* Restrict other routes */}
          <Route path="*" element={<Navigate to={'/'} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
