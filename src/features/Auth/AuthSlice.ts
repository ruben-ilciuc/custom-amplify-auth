import { Auth } from '@aws-amplify/auth'
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { StoreStatus } from '../../common/types'
import { ConfirmSignUpForm } from '../../components/ConfirmSignUp/ConfirmSignUp.types'
import { ForgotPasswordForm } from '../../components/ForgotPassword/ForgotPassword.types'
import { CognitoUserAmplify } from '../../components/Private/Private.types'
import { NewPasswordForm, ResetPasswordForm } from '../../components/ResetPassword/ResetPassword.types'
import { SignInForm } from '../../components/SignIn/SignIn.types'
import { SignUpForm } from '../../components/SignUp/SignUp.types'
import { AuthState } from './Auth.types'
import {
  amplifyConfirmSignUp,
  amplifyForgotPassword,
  amplifyNewPassword,
  amplifyResendSignUp,
  amplifyResetPassword,
  amplifySignIn,
  amplifySignOut,
  amplifySignUp,
} from './AuthAPI'

const initialState: AuthState = {
  isAuthenticated: false,
  message: "",
  status: StoreStatus.Idle,
  user: null,
}

export const refreshToken = createAsyncThunk("auth/refreshToken", async () => {
  // Adding the bypassCache will force Amplify to get the user details from Cognito
  // instead of LocalStorage and will refresh the token as well
  const cognitoUser: CognitoUserAmplify = await Auth.currentAuthenticatedUser({ bypassCache: true })
  return cognitoUser?.attributes
})

export const signUp = createAsyncThunk("auth/signUp", async (data: SignUpForm) => {
  return amplifySignUp(data)
})

export const confirmSignUp = createAsyncThunk("auth/confirmSignUp", async (data: ConfirmSignUpForm) => {
  return amplifyConfirmSignUp(data)
})

export const resendSignUp = createAsyncThunk("auth/resendSignUp", async (data: ConfirmSignUpForm) => {
  return amplifyResendSignUp(data)
})

export const signIn = createAsyncThunk("auth/signIn", async (data: SignInForm) => {
  await amplifySignIn(data)
  return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (data: ForgotPasswordForm) => {
  return await amplifyForgotPassword(data)
})

export const resendForgotPassword = createAsyncThunk("auth/resendForgotPassword", async (data: ForgotPasswordForm) => {
  return await amplifyForgotPassword(data)
})

export const resetPassword = createAsyncThunk("auth/resetPassword", async (data: ResetPasswordForm) => {
  return amplifyResetPassword(data)
})

export const newPassword = createAsyncThunk("auth/newPassword", async (data: NewPasswordForm) => {
  await amplifyNewPassword(data)
  return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
})

export const signOut = createAsyncThunk("auth/signOut", async () => {
  return amplifySignOut()
})

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
