import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { classNames } from 'primereact/utils'
import React, { FC, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { signIn } from '../../features/Auth/Auth.service'
import { resetErrors, resetState } from '../../features/Auth/Auth.slice'
import { SignInForm, SignInProps } from './SignIn.types'

export const SignIn: FC<SignInProps> = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, message, isAuthenticated } = useAppSelector(
    (state) => state.auth
  )

  const [showMessage, setShowMessage] = useState(false)
  const [formData, setFormData] = useState<SignInForm>()
  const defaultValues: SignInForm = {
    email: "",
    password: "",
  }

  useEffect(() => {
    dispatch(resetState())
  }, [dispatch])

  useEffect(() => {
    if (message === "User is not confirmed.") {
      navigate("/confirm", { state: { email: formData?.email } })
    } else if (
      [StoreStatus.Failed, StoreStatus.Succeeded].includes(status) &&
      !showMessage
    ) {
      setShowMessage(true)
    }
  }, [formData?.email, message, navigate, showMessage, status])

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
    return (
      errors[name] && <small className="p-error">{errors[name]?.message}</small>
    )
  }

  const onCloseDialog = () => {
    setShowMessage(false)
    dispatch(resetErrors())
    if (status === StoreStatus.Succeeded) {
      navigate("/private", { state: { email: formData?.email } })
    }
  }
  const dialogFooter = (
    <div className="flex justify-content-center">
      <Button
        label={
          status === StoreStatus.Succeeded ? "Access my account" : "Try again"
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
                isAuthenticated ? "check-circle" : "exclamation-triangle"
              } mr-2`}
              style={{
                fontSize: "2rem",
                color: isAuthenticated ? "var(--green-500)" : "var(--red-500)",
              }}
            ></i>
            Authentication {isAuthenticated ? "Succeeded!" : "Failed!"}
          </h4>
          {isAuthenticated ? (
            <p style={{ lineHeight: 1.5 }}>
              Welcome back. You're logged in as <b>{formData?.email}</b>
            </p>
          ) : (
            <code style={{ lineHeight: 1.5 }}>{message}</code>
          )}
        </div>
      </Dialog>

      <div className="flex">
        <div className="card p-card">
          <h2 className="text-center">Access your account</h2>
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

            <Button
              type="submit"
              label="Sign in"
              className="mt-2"
              loading={status === StoreStatus.Loading}
            />
          </form>
          <p className="mt-4">
            Don't remember your password?{" "}
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
