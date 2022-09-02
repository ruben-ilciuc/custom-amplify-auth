import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { InputMask } from 'primereact/inputmask'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { classNames } from 'primereact/utils'
import React, { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { confirmSignUp, forgotPassword } from '../../features/Auth/Auth.service'
import { resetErrors, resetState } from '../../features/Auth/Auth.slice'
import { ResetPasswordForm, ResetPasswordProps } from './ResetPassword.types'

export const ResetPassword: FC<ResetPasswordProps> = ({ isNewPassword }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, message } = useAppSelector((state) => state.auth)

  const [showMessage, setShowMessage] = useState(false)
  const [formData, setFormData] = useState<ResetPasswordForm>()
  const defaultValues: ResetPasswordForm = {
    email: (location.state as Record<string, string>)?.email,
    code: "",
    password: "",
    confirmPassword: "",
  }

  useEffect(() => {
    dispatch(resetState())
    if (!(location.state as Record<string, string>)?.email) {
      navigate("/", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      [StoreStatus.Failed, StoreStatus.Succeeded].includes(status) &&
      !showMessage
    ) {
      setShowMessage(true)
    }
  }, [showMessage, status])

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResetPasswordForm>({ defaultValues })

  const onSubmit = (data: ResetPasswordForm) => {
    setFormData(data)
    reset()
    dispatch(
      confirmSignUp({
        email: data.email,
        code: String(data.code.match(/(\d)+/g)?.join("")),
      })
    )
  }

  const getFormErrorMessage = (name: keyof ResetPasswordForm) => {
    return (
      errors[name] && <small className="p-error">{errors[name]?.message}</small>
    )
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
        label={
          status === StoreStatus.Succeeded ? "Access your account" : "Try again"
        }
        className="p-button-text"
        autoFocus
        onClick={onCloseDialog}
      />
    </div>
  )

  const passwordHeader = <h6>Pick a password</h6>
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </React.Fragment>
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
              className={`pi pi-${
                status === StoreStatus.Succeeded
                  ? "check-circle"
                  : "exclamation-triangle"
              } mr-2`}
              style={{
                fontSize: "2rem",
                color:
                  status === StoreStatus.Succeeded
                    ? "var(--green-500)"
                    : "var(--red-500)",
              }}
            ></i>
            Reset password{" "}
            {status === StoreStatus.Succeeded ? "succeeded!" : "failed!"}
          </h4>
          {status === StoreStatus.Succeeded ? (
            <p style={{ lineHeight: 1.5 }}>
              Tha password for your account <b>{formData?.email}</b> has been
              changed.
            </p>
          ) : (
            <code style={{ lineHeight: 1.5 }}>{message}</code>
          )}
        </div>
      </Dialog>

      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Reset password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
            <div className="field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Invalid email address. E.g. example@email.com",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputText
                      id={field.name}
                      {...field}
                      disabled
                      readOnly
                      className={classNames({
                        "p-invalid": fieldState.error?.message,
                      })}
                    />
                  )}
                />
                <label
                  htmlFor="email"
                  className={classNames({ "p-error": !!errors.email })}
                >
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
                      className={classNames({
                        "p-invalid": fieldState.error?.message,
                      })}
                    />
                  )}
                />
                <label
                  htmlFor="code"
                  className={classNames({ "p-error": errors.code })}
                >
                  Confirmation code*
                </label>
              </span>
              {getFormErrorMessage("code")}
            </div>
            <div className="field">
              <span className="p-float-label">
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password is required." }}
                  render={({ field, fieldState }) => (
                    <Password
                      id={field.name}
                      {...field}
                      toggleMask
                      className={classNames({
                        "p-invalid": fieldState.error?.message,
                      })}
                      header={passwordHeader}
                      footer={passwordFooter}
                    />
                  )}
                />
                <label
                  htmlFor="password"
                  className={classNames({ "p-error": errors.password })}
                >
                  Password*
                </label>
              </span>
              {getFormErrorMessage("password")}
            </div>
            <div className="field">
              <span className="p-float-label">
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{ required: "Password confirmation is required." }}
                  render={({ field, fieldState }) => (
                    <Password
                      id={field.name}
                      {...field}
                      toggleMask
                      className={classNames({
                        "p-invalid": fieldState.error?.message,
                      })}
                      header={passwordHeader}
                      footer={passwordFooter}
                    />
                  )}
                />
                <label
                  htmlFor="confirmPassword"
                  className={classNames({ "p-error": errors.confirmPassword })}
                >
                  Confirm password*
                </label>
              </span>
              {getFormErrorMessage("confirmPassword")}
            </div>

            <Button
              type="submit"
              label="Confirm"
              className="mt-2"
              loading={status === StoreStatus.Loading}
            />
          </form>
          <p className="mt-4">
            Didn't receive the instruction?{" "}
            <Link
              to="#"
              className="ml-1"
              onClick={() => dispatch(forgotPassword(defaultValues))}
            >
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
