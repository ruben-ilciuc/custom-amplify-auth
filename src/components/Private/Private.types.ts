import {
    UseAuthenticator
} from '@aws-amplify/ui-react/dist/types/components/Authenticator/hooks/useAuthenticator'

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

export interface PrivateProps {
  signOut?: UseAuthenticator["signOut"]
  user?: CognitoUserAmplify
}
