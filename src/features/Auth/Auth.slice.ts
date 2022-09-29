import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { StoreStatus } from '../../common/types'
import {
  confirmSignUp,
  forgotPassword,
  refreshToken,
  resendForgotPassword,
  resendSignUp,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from './Auth.service'
import { AuthState } from './Auth.types'

const initialState: AuthState = {
  isAuthenticated: false,
  message: '',
  status: StoreStatus.Idle,
  user: null,
}

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, { payload }) => ({
      ...state,
      isAuthenticated: true,
      user: payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.fulfilled, (state) => ({
      ...state,
      message: 'Your account is registered. Please check your email for activation instructions.',
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(confirmSignUp.fulfilled, (state) => ({
      ...state,
      message: 'Account confirmed.',
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(resendSignUp.fulfilled, (state) => ({
      ...state,
      message: 'Please check your email for activation instructions.',
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(signIn.fulfilled, (state, { payload }) => ({
      ...state,
      status: StoreStatus.Succeeded,
      isAuthenticated: true,
      user: payload,
    }))
    builder.addCase(forgotPassword.fulfilled, () => ({
      ...initialState,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(resendForgotPassword.fulfilled, () => ({
      ...initialState,
      status: StoreStatus.Idle,
    }))
    builder.addCase(resetPassword.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(signOut.fulfilled, () => initialState)
    builder.addCase(refreshToken.fulfilled, (state, { payload }) => ({
      ...state,
      user: payload,
      isAuthenticated: true,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(refreshToken.rejected, (state) => ({
      ...state,
      status: StoreStatus.Failed,
    }))

    // Handle pending & rejected requests
    builder.addMatcher(
      isAnyOf(
        signUp.pending,
        confirmSignUp.pending,
        resendSignUp.pending,
        signIn.pending,
        forgotPassword.pending,
        resendForgotPassword.pending,
        resetPassword.pending,
        signOut.pending,
        refreshToken.pending,
      ),
      () => ({
        ...initialState,
        status: StoreStatus.Loading,
      }),
    )
    builder.addMatcher(
      isAnyOf(
        signUp.rejected,
        confirmSignUp.rejected,
        resendSignUp.rejected,
        signIn.rejected,
        forgotPassword.rejected,
        resendForgotPassword.rejected,
        resetPassword.rejected,
        signOut.rejected,
      ),
      (state, { error }) => ({
        ...state,
        status: StoreStatus.Failed,
        message: error.message || '',
      }),
    )
  },
})

export const { setUser } = AuthSlice.actions

export default AuthSlice.reducer
