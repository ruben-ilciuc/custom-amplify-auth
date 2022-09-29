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
import { signUp } from '../../features/Auth/Auth.service'
import { SignUpForm, SignUpProps } from './SignUp.types'

export const SignUp: FC<SignUpProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<SignUpForm>()
  const defaultValues: SignUpForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }

  useEffect(() => {
    if (status === StoreStatus.Succeeded) {
      navigate('/confirm', { state: { email: formData?.email } })
    }
  }, [formData?.email, navigate, status])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpForm>({ defaultValues })

  const onSubmit = (data: SignUpForm) => {
    setFormData(data)
    reset()
    dispatch(signUp(data))
  }

  const getFormErrorMessage = (name: keyof SignUpForm) => {
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
          <h2 className="text-center">Create an account</h2>

          <Message />

          <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="p-fluid grid">
              <div className="field col-12 md:col-6">
                <span className="p-float-label">
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: 'Name is required.' }}
                    render={({ field, fieldState }) => (
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus
                        className={classNames({
                          'p-invalid': fieldState.error?.message,
                        })}
                      />
                    )}
                  />
                  <label htmlFor="firstName" className={classNames({ 'p-error': errors.firstName })}>
                    First name*
                  </label>
                </span>
                {getFormErrorMessage('firstName')}
              </div>
              <div className="field col-12 md:col-6">
                <span className="p-float-label">
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: 'Name is required.' }}
                    render={({ field, fieldState }) => (
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus
                        className={classNames({
                          'p-invalid': fieldState.error?.message,
                        })}
                      />
                    )}
                  />
                  <label htmlFor="lastName" className={classNames({ 'p-error': errors.lastName })}>
                    Last name*
                  </label>
                </span>
                {getFormErrorMessage('lastName')}
              </div>
              <div className="field col-12 md:col-12">
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
                    Email*
                  </label>
                </span>
                {getFormErrorMessage('email')}
              </div>
              <div className="field col-12 md:col-12">
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
              <div className="field col-12 md:col-12">
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
                  <label
                    htmlFor="confirmPassword"
                    className={classNames({
                      'p-error': errors.confirmPassword,
                    })}
                  >
                    Confirm password*
                  </label>
                </span>
                {getFormErrorMessage('confirmPassword')}
              </div>
            </div>

            <Button type="submit" label="Get started" className="mt-2" loading={status === StoreStatus.Succeeded} />
          </form>
          <div className="flex justify-content-center mt-2">
            <p>
              Already have an account? <Link to="/">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
