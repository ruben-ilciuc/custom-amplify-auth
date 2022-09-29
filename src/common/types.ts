export enum StoreStatus {
  Idle = 'Idle',
  Loading = 'Loading',
  Failed = 'Failed',
  Succeeded = 'Succeeded',
}

export interface CognitoAttributes {
  email: string
  email_verified: boolean
  given_name: string
  family_name: string
  sub: string
}

export interface CognitoUserAmplify {
  username: string
  attributes: CognitoAttributes
}
