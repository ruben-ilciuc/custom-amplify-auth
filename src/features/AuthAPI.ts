import { Auth, CognitoUser } from '@aws-amplify/auth'

import { ConfirmSignUpForm } from '../../components/ConfirmSignUp/ConfirmSignUp.types'
import { ForgotPasswordForm } from '../../components/ForgotPassword/ForgotPassword.types'
import {
    NewPasswordForm, ResetPasswordForm
} from '../../components/ResetPassword/ResetPassword.types'
import { SignInForm } from '../../components/SignIn/SignIn.types'
import { SignUpForm } from '../../components/SignUp/SignUp.types'

export function amplifySignUp({ firstName, lastName, email, password }: SignUpForm) {
  return Auth.signUp({ username: email, password, attributes: { given_name: firstName, family_name: lastName } })
}

export function amplifyConfirmSignUp({ email, code }: ConfirmSignUpForm) {
  return Auth.confirmSignUp(email, code)
}

export function amplifyResendSignUp({ email }: ConfirmSignUpForm) {
  return Auth.resendSignUp(email)
}

export function amplifySignIn({ email, password }: SignInForm): Promise<CognitoUser | null> {
  return Auth.signIn(email, password)
}

export function amplifyForgotPassword({ email }: ForgotPasswordForm) {
  return Auth.forgotPassword(email)
}

export function amplifyResetPassword({ email, code, password }: ResetPasswordForm) {
  return Auth.forgotPasswordSubmit(email, code, password)
}

export function amplifyNewPassword({ email, password }: NewPasswordForm) {
  return Auth.completeNewPassword(email, password)
}

export function amplifySignOut() {
  return Auth.signOut()
}
