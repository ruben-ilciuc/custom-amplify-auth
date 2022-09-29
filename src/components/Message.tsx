import { Message as PrimeMessage } from 'primereact/message'
import React from 'react'

import { useAppSelector } from '../app/hooks'
import { StoreStatus } from '../common/types'

export const Message: React.FC = () => {
  const { message, status } = useAppSelector((state) => state.auth)

  const severity = status === StoreStatus.Failed ? 'error' : status === StoreStatus.Succeeded ? 'success' : 'info'

  return <PrimeMessage className={`w-full ${message?.length ? '' : 'hidden'}`} severity={severity} title={status} text={message} />
}
