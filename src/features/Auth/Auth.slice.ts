import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { StoreStatus } from '../../common/types'
import {
  confirmSignUp,
  forgotPassword,
  newPassword,
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
  message: "",
  status: StoreStatus.Idle,
  user: null,
}

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: () => ({
      ...initialState,
    }),
    resetStatus: (state) => ({
      ...state,
      status: StoreStatus.Idle,
    }),
    resetErrors: (state) => ({
      ...state,
      message: "",
      status: StoreStatus.Idle,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(confirmSignUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(resendSignUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Idle,
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
    builder.addCase(newPassword.fulfilled, (state, { payload }) => ({
      ...state,
      status: StoreStatus.Succeeded,
      user: payload,
    }))
    builder.addCase(signOut.fulfilled, () => initialState)
    builder.addCase(refreshToken.fulfilled, (state, { payload }) => ({
      ...state,
      user: payload,
      isAuthenticated: true,
      status: StoreStatus.Succeeded,
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
        newPassword.pending,
        signOut.pending,
        refreshToken.pending
      ),
      (state) => ({
        ...state,
        status: StoreStatus.Loading,
      })
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
        newPassword.rejected,
        signOut.rejected,
        refreshToken.rejected
      ),
      (state, { error }) => ({
        ...state,
        status: StoreStatus.Failed,
        message: error.message || "",
      })
    )
  },
})

export const { resetStatus, resetState, resetErrors } = AuthSlice.actions

export default AuthSlice.reducer
