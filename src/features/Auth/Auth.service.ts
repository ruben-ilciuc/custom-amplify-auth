import { Auth } from '@aws-amplify/auth'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { ConfirmSignUpForm } from '../../components/ConfirmSignUp/ConfirmSignUp.types'
import { ForgotPasswordForm } from '../../components/ForgotPassword/ForgotPassword.types'
import { CognitoUserAmplify } from '../../components/Private/Private.types'
import { NewPasswordForm, ResetPasswordForm } from '../../components/ResetPassword/ResetPassword.types'
import { SignInForm } from '../../components/SignIn/SignIn.types'
import { SignUpForm } from '../../components/SignUp/SignUp.types'

export const refreshToken = createAsyncThunk("auth/refreshToken", async () => {
  // Adding the bypassCache will force Amplify to get the user details from Cognito
  // instead of LocalStorage and will refresh the token as well
  const cognitoUser: CognitoUserAmplify = await Auth.currentAuthenticatedUser({
    bypassCache: true,
  })
  return cognitoUser?.attributes
})

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ email, password, firstName, lastName }: SignUpForm) => {
    return Auth.signUp({
      username: email,
      password,
      attributes: { given_name: firstName, family_name: lastName },
    })
  }
)

export const confirmSignUp = createAsyncThunk(
  "auth/confirmSignUp",
  async ({ email, code }: ConfirmSignUpForm) => {
    return Auth.confirmSignUp(email, code)
  }
)

export const resendSignUp = createAsyncThunk(
  "auth/resendSignUp",
  async ({ email }: ConfirmSignUpForm) => {
    return Auth.resendSignUp(email)
  }
)

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }: SignInForm) => {
    await Auth.signIn(email, password)
    return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
  }
)

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: ForgotPasswordForm) => {
    return await Auth.forgotPassword(email)
  }
)

export const resendForgotPassword = createAsyncThunk(
  "auth/resendForgotPassword",
  async ({ email }: ForgotPasswordForm) => {
    return await Auth.forgotPassword(email)
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, password }: ResetPasswordForm) => {
    return Auth.forgotPasswordSubmit(email, code, password)
  }
)

export const newPassword = createAsyncThunk(
  "auth/newPassword",
  async ({ email, password }: NewPasswordForm) => {
    await Auth.completeNewPassword(email, password)
    return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
  }
)

export const signOut = createAsyncThunk("auth/signOut", async () => {
  return Auth.signOut()
})
