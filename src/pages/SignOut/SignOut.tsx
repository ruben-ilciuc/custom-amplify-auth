import React, { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { StoreStatus } from '../../common/types'
import { signOut } from '../../features/Auth/Auth.service'

export const SignOut: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(signOut())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if ([StoreStatus.Failed, StoreStatus.Succeeded].includes(status)) {
      navigate("/")
    }
  }, [navigate, status])

  return <div>Logging out...</div>
}
