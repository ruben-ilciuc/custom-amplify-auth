import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { classNames } from 'primereact/utils'
import React, { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { Message } from '../../components/Message'
import { signIn } from '../../features/Auth/Auth.service'
import { SignInForm, SignInProps } from './SignIn.types'

export const SignIn: FC<SignInProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, message, isAuthenticated } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<SignInForm>()
  const defaultValues: SignInForm = {
    email: '',
    password: '',
  }

  useEffect(() => {
    if (message === 'User is not confirmed.') {
      navigate('/confirm', { state: { email: formData?.email } })
    }
    if (isAuthenticated) {
      navigate('/private')
    }
  }, [formData?.email, message, navigate, status, isAuthenticated])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignInForm>({ defaultValues })

  const onSubmit = (data: SignInForm) => {
    setFormData(data)
    reset()
    dispatch(signIn(data))
  }

  const getFormErrorMessage = (name: keyof SignInForm) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  }

  const passwordHeader = <h6>Pick a password</h6>
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: '1.5' }}>
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </React.Fragment>
  )

  return (
    <div className="container">
      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Access your account</h2>

          <Message />

          <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: 'Invalid email address. E.g. example@email.com',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputText
                      id={field.name}
                      {...field}
                      className={classNames({
                        'p-invalid': fieldState.error?.message,
                      })}
                    />
                  )}
                />
                <label htmlFor="email" className={classNames({ 'p-error': !!errors.email })}>
                  Email address*
                </label>
              </span>
              {getFormErrorMessage('email')}
            </div>
            <div className="field">
              <span className="p-float-label">
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: 'Password is required.' }}
                  render={({ field, fieldState }) => (
                    <Password
                      id={field.name}
                      {...field}
                      toggleMask
                      className={classNames({
                        'p-invalid': fieldState.error?.message,
                      })}
                      header={passwordHeader}
                      footer={passwordFooter}
                    />
                  )}
                />
                <label htmlFor="password" className={classNames({ 'p-error': errors.password })}>
                  Password*
                </label>
              </span>
              {getFormErrorMessage('password')}
            </div>

            <Button type="submit" label="Sign in" className="mt-2" loading={status === StoreStatus.Loading} />
          </form>
          <p className="mt-4">
            Don't remember your password?{' '}
            <Link to="/forgot-password" className="ml-1">
              Reset Password
            </Link>
          </p>
          <p className="mt-2">
            Don't have an account? <Link to="/sign-up">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
