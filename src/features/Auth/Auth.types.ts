import { StoreStatus } from '../../common/types'
import { CognitoAttributes } from '../../components/Private/Private.types'

export interface AuthState {
  isAuthenticated: boolean
  message: string
  status: StoreStatus
  user: CognitoAttributes | null
}
