import { Auth } from '@aws-amplify/auth'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { CognitoUserAmplify } from '../../common/types'
import { ConfirmSignUpForm } from '../../pages/ConfirmSignUp/ConfirmSignUp.types'
import { ForgotPasswordForm } from '../../pages/ForgotPassword/ForgotPassword.types'
import { ResetPasswordForm } from '../../pages/ResetPassword/ResetPassword.types'
import { SignInForm } from '../../pages/SignIn/SignIn.types'
import { SignUpForm } from '../../pages/SignUp/SignUp.types'

export const refreshToken = createAsyncThunk('auth/refreshToken', async () => {
  const cognitoUser: CognitoUserAmplify = await Auth.currentAuthenticatedUser()
  return cognitoUser?.attributes
})

export const signUp = createAsyncThunk('auth/signUp', async ({ email, password, firstName, lastName }: SignUpForm) => {
  await Auth.signUp({
    username: email,
    password,
    attributes: { given_name: firstName, family_name: lastName },
  })
})

export const confirmSignUp = createAsyncThunk('auth/confirmSignUp', async ({ email, code }: ConfirmSignUpForm) => {
  return Auth.confirmSignUp(email, code)
})

export const resendSignUp = createAsyncThunk('auth/resendSignUp', async ({ email }: ConfirmSignUpForm) => {
  return Auth.resendSignUp(email)
})

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }: SignInForm) => {
  const cognitoUser: CognitoUserAmplify = await Auth.signIn(email, password)
  return cognitoUser.attributes
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }: ForgotPasswordForm) => {
  return await Auth.forgotPassword(email)
})

export const resendForgotPassword = createAsyncThunk('auth/resendForgotPassword', async ({ email }: ForgotPasswordForm) => {
  return await Auth.forgotPassword(email)
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, code, password }: ResetPasswordForm) => {
  return Auth.forgotPasswordSubmit(email, code, password)
})

export const signOut = createAsyncThunk('auth/signOut', async () => {
  return Auth.signOut()
})
