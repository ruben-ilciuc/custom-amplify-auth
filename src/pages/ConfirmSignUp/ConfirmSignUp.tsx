import { Button } from 'primereact/button'
import { InputMask } from 'primereact/inputmask'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { Message } from '../../components/Message'
import { confirmSignUp, resendSignUp } from '../../features/Auth/Auth.service'
import { ConfirmSignUpForm, ConfirmSignUpProps } from './ConfirmSignUp.types'

export const ConfirmSignUp: FC<ConfirmSignUpProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status } = useAppSelector((state) => state.auth)

  const defaultValues: ConfirmSignUpForm = {
    email: (location.state as Record<string, string>)?.email,
    code: '',
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
  } = useForm<ConfirmSignUpForm>({ defaultValues })

  const onSubmit = (data: ConfirmSignUpForm) => {
    reset()
    dispatch(
      confirmSignUp({
        email: data.email,
        code: String(data.code.match(/(\d)+/g)?.join('')),
      }),
    )
      .then((res) => {
        if (res.type === 'fulfilled') {
          navigate('/', { replace: true })
        }
      })
      .catch(console.error)
  }

  const getFormErrorMessage = (name: keyof ConfirmSignUpForm) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  }

  return (
    <div className="container">
      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Account confirmation</h2>

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

            <Button type="submit" label="Confirm" className="mt-2" loading={status === StoreStatus.Loading} />
          </form>
          <p className="mt-4">
            Didn't receive the instruction?{' '}
            <Link
              to="#"
              className="ml-1"
              onClick={() =>
                dispatch(
                  resendSignUp({
                    email: String((location.state as Record<string, string>)?.email),
                    code: '',
                  }),
                )
              }
            >
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
