import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputMask } from 'primereact/inputmask'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { classNames } from 'primereact/utils'
import React, { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { Message } from '../../components/Message'
import { forgotPassword, resetPassword } from '../../features/Auth/Auth.service'
import { ResetPasswordForm, ResetPasswordProps } from './ResetPassword.types'

export const ResetPassword: FC<ResetPasswordProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status } = useAppSelector((state) => state.auth)

  const defaultValues: ResetPasswordForm = {
    email: (location.state as Record<string, string>)?.email,
    code: '',
    password: '',
    confirmPassword: '',
  }

  useEffect(() => {
    if (!(location.state as Record<string, string>)?.email) {
      navigate('/', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResetPasswordForm>({ defaultValues })

  const onSubmit = (data: ResetPasswordForm) => {
    reset()

    dispatch(
      resetPassword({
        email: data.email,
        code: String(data.code.match(/(\d)+/g)?.join('')),
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    )
      .then((res) => {
        if (res.type === 'fulfilled') {
          navigate('/', { replace: true })
        }
      })
      .catch(console.error)
  }

  const getFormErrorMessage = (name: keyof ResetPasswordForm) => {
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
          <h2 className="text-center">Reset password</h2>

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
                      disabled
                      readOnly
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
                  name="code"
                  control={control}
                  rules={{ required: 'Confirmation code is required.' }}
                  render={({ field, fieldState }) => (
                    <InputMask
                      id={field.name}
                      mask="9  9  9  9  9  9"
                      {...field}
                      className={classNames({
                        'p-invalid': fieldState.error?.message,
                      })}
                    />
                  )}
                />
                <label htmlFor="code" className={classNames({ 'p-error': errors.code })}>
                  Confirmation code*
                </label>
              </span>
              {getFormErrorMessage('code')}
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
            <div className="field">
              <span className="p-float-label">
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{ required: 'Password confirmation is required.' }}
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
                <label htmlFor="confirmPassword" className={classNames({ 'p-error': errors.confirmPassword })}>
                  Confirm password*
                </label>
              </span>
              {getFormErrorMessage('confirmPassword')}
            </div>

            <Button type="submit" label="Confirm" className="mt-2" loading={status === StoreStatus.Loading} />
          </form>
          <p className="mt-4">
            Didn't receive the instruction?{' '}
            <Link to="#" className="ml-1" onClick={() => dispatch(forgotPassword(defaultValues))}>
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
