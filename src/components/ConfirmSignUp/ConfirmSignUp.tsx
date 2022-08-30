import '../../styles/main.scss'

import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputMask } from 'primereact/inputmask'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import React, { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { confirmSignUp, resendSignUp, resetErrors, resetState } from '../../features/Auth/AuthSlice'
import { ConfirmSignUpForm, ConfirmSignUpProps } from './ConfirmSignUp.types'

export const ConfirmSignUp: FC<ConfirmSignUpProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, message } = useAppSelector((state) => state.auth)

  const [showMessage, setShowMessage] = useState(false)
  const [formData, setFormData] = useState<ConfirmSignUpForm>()
  const defaultValues: ConfirmSignUpForm = {
    email: (location.state as Record<string, string>)?.email,
    code: "",
  }

  useEffect(() => {
    if (!(location.state as Record<string, string>)?.email) {
      navigate("/", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch(resetState())
  }, [dispatch])

  useEffect(() => {
    if ([StoreStatus.Failed, StoreStatus.Succeeded].includes(status) && !showMessage) {
      setShowMessage(true)
    }
  }, [showMessage, status])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ConfirmSignUpForm>({ defaultValues })

  const onSubmit = (data: ConfirmSignUpForm) => {
    setFormData(data)
    reset()
    dispatch(confirmSignUp({ email: data.email, code: String(data.code.match(/(\d)+/g)?.join("")) }))
  }

  const getFormErrorMessage = (name: keyof ConfirmSignUpForm) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  }

  const onCloseDialog = () => {
    setShowMessage(false)
    dispatch(resetErrors())
    if (status === StoreStatus.Succeeded) {
      navigate("/", { state: { email: formData?.email } })
    }
  }

  const dialogFooter = (
    <div className="flex justify-content-center">
      <Button
        label={status === StoreStatus.Succeeded ? "Access your account" : "Try again"}
        className="p-button-text"
        autoFocus
        onClick={onCloseDialog}
      />
    </div>
  )

  return (
    <div className="container">
      <Dialog
        visible={showMessage}
        onHide={onCloseDialog}
        position="top"
        footer={dialogFooter}
        showHeader={false}
        breakpoints={{ "960px": "80vw" }}
        style={{ width: "50vw" }}
      >
        <div className="flex justify-content-center flex-column pt-6 px-3">
          <h4 className="flex align-items-center">
            <i
              className={`pi pi-${status === StoreStatus.Succeeded ? "check-circle" : "exclamation-triangle"} mr-2`}
              style={{ fontSize: "2rem", color: status === StoreStatus.Succeeded ? "var(--green-500)" : "var(--red-500)" }}
            ></i>
            Account confirmation {status === StoreStatus.Succeeded ? "Succeeded!" : "Failed!"}
          </h4>
          {status === StoreStatus.Succeeded ? (
            <p style={{ lineHeight: 1.5 }}>
              Your account <b>{formData?.email}</b> is active. You can access your account now.
            </p>
          ) : (
            <code style={{ lineHeight: 1.5 }}>{message}</code>
          )}
        </div>
      </Dialog>

      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Account confirmation</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required.",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: "Invalid email address. E.g. example@email.com" },
                  }}
                  render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} disabled readOnly className={classNames({ "p-invalid": fieldState.error?.message })} />
                  )}
                />
                <label htmlFor="email" className={classNames({ "p-error": !!errors.email })}>
                  Email address*
                </label>
              </span>
              {getFormErrorMessage("email")}
            </div>
            <div className="field">
              <span className="p-float-label">
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: "Confirmation code is required." }}
                  render={({ field, fieldState }) => (
                    <InputMask
                      id={field.name}
                      mask="9  9  9  9  9  9"
                      {...field}
                      className={classNames({ "p-invalid": fieldState.error?.message })}
                    />
                  )}
                />
                <label htmlFor="code" className={classNames({ "p-error": errors.code })}>
                  Confirmation code*
                </label>
              </span>
              {getFormErrorMessage("code")}
            </div>

            <Button type="submit" label="Confirm" className="mt-2" loading={status === StoreStatus.Loading} />
          </form>
          <p className="mt-4">
            Didn't receive the instruction?{" "}
            <Link
              to="#"
              className="ml-1"
              onClick={() => dispatch(resendSignUp({ email: String((location.state as Record<string, string>)?.email), code: "" }))}
            >
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
