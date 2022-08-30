import './App.css'

import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// import { useAppDispatch } from './app/hooks'
import { ConfirmSignUp } from './components/ConfirmSignUp/ConfirmSignUp'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import Private from './components/Private/Private'
import { ResetPassword } from './components/ResetPassword/ResetPassword'
import { SignIn } from './components/SignIn/SignIn'
import { SignOut } from './components/SignOut/SignOut'
import { SignUp } from './components/SignUp/SignUp'

function App() {
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
          <Route path="/new-password" element={<ResetPassword isNewPassword />} />
          <Route path="/sign-out" element={<SignOut />} />

          {/* Private route */}
          <Route path="/private" element={<Private />} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to={"/"} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
