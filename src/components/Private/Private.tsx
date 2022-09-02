import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import React, { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { refreshToken, signOut } from '../../features/Auth/Auth.service'
import { PrivateProps } from './Private.types'

const Private: FC<PrivateProps> = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(refreshToken()).then((userAttributes) => {
      if (!userAttributes.payload) {
        navigate("/", { replace: true })
      }
    })
  }, [dispatch, navigate])

  const logUserOut = () => {
    dispatch(signOut()).then(() => navigate("/", { replace: true }))
  }

  const footerTemplate = () => (
    <>
      <Divider />
      <Button
        className="p-button-raised p-button-primary p-button-text mx-auto block"
        label="Sign out"
        onClick={logUserOut}
        loading={status === StoreStatus.Loading}
      />
    </>
  )

  return (
    <div className="container flex align-items-start justify-content-center">
      {!!user ? (
        <Card
          title="User profile"
          subTitle="Cognito user details"
          footer={footerTemplate}
          className="text-left w-5"
        >
          <div className="grid mt-3">
            <div className="col-3 text-500">Username:</div>
            <div className="col">
              <Tag className="font-bold">{user?.sub}</Tag>
            </div>
          </div>
          <div className="grid">
            <div className="col-3 text-500">Name:</div>
            <div className="col text-color-secondary font-bold">
              {user?.given_name} {user?.family_name}
            </div>
          </div>
          <div className="grid">
            <div className="col-3 text-500">Email:</div>
            <div className="col text-color-secondary font-bold">
              {user?.email}
            </div>
          </div>
          <div className="grid">
            <div className="col-3 text-500">Verified:</div>
            <div className="col">
              <Tag className="font-bold uppercase" severity="success">
                {String(!!user?.email_verified)}
              </Tag>
            </div>
          </div>
        </Card>
      ) : (
        <ProgressSpinner style={{ width: "120px", height: "120px" }} />
      )}
    </div>
  )
}

export default Private
