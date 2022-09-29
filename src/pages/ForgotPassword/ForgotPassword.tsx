import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { forgotPassword } from '../../features/Auth/Auth.service'
import { ForgotPasswordForm, ForgotPasswordProps } from './ForgotPassword.types'

export const ForgotPassword: FC<ForgotPasswordProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<ForgotPasswordForm>()
  const defaultValues: ForgotPasswordForm = {
    email: '',
  }

  useEffect(() => {
    if (status === StoreStatus.Succeeded) {
      navigate('/reset-password', { state: formData })
    }
  }, [dispatch, formData, navigate, status])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ForgotPasswordForm>({ defaultValues })

  const onSubmit = (data: ForgotPasswordForm) => {
    setFormData(data)
    reset()
    dispatch(forgotPassword(data))
  }

  const getFormErrorMessage = (name: keyof ForgotPasswordForm) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  }

  return (
    <div className="container">
      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Forgot password</h2>
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

            <Button type="submit" label="Request instructions" className="mt-2" loading={status === StoreStatus.Loading} />
          </form>
        </div>
      </div>
    </div>
  )
}
