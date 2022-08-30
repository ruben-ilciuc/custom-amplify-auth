export interface ResetPasswordProps {
  isNewPassword?: boolean
}

export interface ResetPasswordForm {
  email: string
  code: string
  password: string
  confirmPassword: string
}

export interface NewPasswordForm {
  email: string
  password: string
  confirmPassword: string
}
