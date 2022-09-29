import { CognitoAttributes, StoreStatus } from '../../common/types'

export interface AuthState {
  isAuthenticated: boolean
  message: string
  status: StoreStatus
  user: CognitoAttributes | null
}
