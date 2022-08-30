import { Auth } from '@aws-amplify/auth'

Auth.configure({
  region: process.env.REACT_APP_REGION,
  userPoolId: process.env.REACT_APP_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  mandatorySignIn: true,
  // authenticationFlowType: "USER_PASSWORD_AUTH",
  // cookieStorage: {
  //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
  //   domain: ".yourdomain.com",
  //   // OPTIONAL - Cookie path
  //   path: "/",
  //   // OPTIONAL - Cookie expiration in days
  //   expires: 365,
  //   // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
  //   sameSite: "strict" | "lax",
  //   // OPTIONAL - Cookie secure flag
  //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
  //   secure: true,
  // },
})
