# Amplify authentication with custom UI using ReactJS

In this article we'll going to cover the Amplify authentication with custom UI using ReactJS. It requires basic knowledge about **react@18** and **redux toolkit**.

The application that I'm presenting to you can be find here: [custom-amplify-auth](https://github.com/ruben-ilciuc/custom-amplify-auth)

## ! IMPORTANT

Please, take into consideration that this approach is **NOT** fully secured since you store the `idToken`, `accessToken`, `refreshToken` and other sensitive information about the user in the Local Storage. This opens the door for **XXS** and **CSRF** attacks.

## Summary

- [Amplify authentication with custom UI using ReactJS](#amplify-authentication-with-custom-ui-using-reactjs)
  - [! IMPORTANT](#-important)
  - [Summary](#summary)
    - [1. Configure Cognito](#1-configure-cognito)
    - [2. Initialize ReactJS app](#2-initialize-reactjs-app)
    - [3. Configure Amplify](#3-configure-amplify)
    - [4. Configure auth reducer](#4-configure-auth-reducer)
    - [5. Conclusion](#5-conclusion)

### 1. Configure Cognito

Before configuring the Cognito you need to create an account to AWS Amazon. For creating the account you need to provide credit card information for validation and they will charge you with 1.00 USD. But don't worry, you'll get the mony back in 3-5 business days and you'll get a year free tier.

In order to keep this article short I wont go through Cognito configuration step by step, but I give you an overview of my configuration:

| Option                                               | Value                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cognito user pool sign-in options                    | **Email**                                                                                                                                  |
| Password policy                                      | **Default**                                                                                                                                |
| Multi-factor authentication                          | **No MFA**                                                                                                                                 |
| User account recovery                                | **Default**                                                                                                                                |
| Self-service sign-up                                 | **Default** (we want users to be able to sign-up by themselves)                                                                            |
| Attribute verification and user account confirmation | **Default**                                                                                                                                |
| Required attributes                                  | **given_name, family_name**                                                                                                                |
| Custom attributes                                    | **None** (you can add if you need)                                                                                                         |
| Configure message delivery                           | **Send email with Cognito** (The preferred option is SES, but see [PRICING](https://aws.amazon.com/ses/pricing) first to avoid surcharges) |
| User Pool name                                       | **demo-auth** (use your imagination)                                                                                                       |
| Hosted authenticaton pages                           | **Unselected** (we use our custom design)                                                                                                  |
| Initial app client                                   | **Default**                                                                                                                                |
| Advanced app client settings                         | Authentication flow: **ALLOW_REFRESH_TOKEN_AUTH, ALLOW_USER_PASSWORD_AUTH, ALLOW_USER_SRP_AUTH** else **Default**                          |

### 2. Initialize ReactJS app

Before starting the react project make sure the Node version is the same to have a similar result as shown in this article or adapt it to your Node version: v16.16.0

To initialize the app use command:

```shell
npx create-react-app my-app --template redux-typescript
```

It will create a boilerplate from where you can start codding and don't have to worry about webpack or babel. All of it are preconfigured and hidden.

### 3. Configure Amplify

Install the amplify package using command:

```shell
npm install @aws-amplify/auth
```

In the `src/app` directory create a new file `aws-config.ts` where we configure the amplify to use our Cognito for authentication.

```typescript
import { Auth } from "@aws-amplify/auth"

Auth.configure({
  region: process.env.REACT_APP_REGION,
  userPoolId: process.env.REACT_APP_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  mandatorySignIn: true,
  authenticationFlowType: "USER_PASSWORD_AUTH",
})
```

We set up the amplify configuration, but it needs to be initialized at the start of our application. So, in the `index.tsx` at the top add the next line:

```typescript
import "./app/aws-config" // amplify auth init
```

Last but not least, create a file in the rood directory named `.env` and add next lines:

```properties
REACT_APP_USER_POOL_ID=<ADD_YOUR_USER_POOL_ID>
REACT_APP_CLIENT_ID=<ADD_YOUR_CLIENT_ID>
REACT_APP_REGION=<ADD_YOUR_REGION>
```

Now, our application is fully configured to use amplify for authentication. The only part that our application needs are the authentication components for sign-in, sign-up etc.

### 4. Configure auth reducer

In the `src/feature` directory we are going to add the configuration for our state management.

Create a new file named `Auth.service.ts` and add next lines of code:

```typescript
import { Auth } from "@aws-amplify/auth"
import { createAsyncThunk } from "@reduxjs/toolkit"

import { ConfirmSignUpForm } from "../components/ConfirmSignUp/ConfirmSignUp.types"
import { ForgotPasswordForm } from "../components/ForgotPassword/ForgotPassword.types"
import { CognitoUserAmplify } from "../components/Private/Private.types"
import {
  NewPasswordForm,
  ResetPasswordForm,
} from "../components/ResetPassword/ResetPassword.types"
import { SignInForm } from "../components/SignIn/SignIn.types"
import { SignUpForm } from "../components/SignUp/SignUp.types"

export const refreshToken = createAsyncThunk("auth/refreshToken", async () => {
  // Adding the bypassCache will force Amplify to get the user details from Cognito
  // instead of LocalStorage and will refresh the token as well
  const cognitoUser: CognitoUserAmplify = await Auth.currentAuthenticatedUser({
    bypassCache: true,
  })
  return cognitoUser?.attributes
})

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ email, password, firstName, lastName }: SignUpForm) => {
    return Auth.signUp({
      username: email,
      password,
      attributes: { given_name: firstName, family_name: lastName },
    })
  }
)

export const confirmSignUp = createAsyncThunk(
  "auth/confirmSignUp",
  async ({ email, code }: ConfirmSignUpForm) => {
    return Auth.confirmSignUp(email, code)
  }
)

export const resendSignUp = createAsyncThunk(
  "auth/resendSignUp",
  async ({ email }: ConfirmSignUpForm) => {
    return Auth.resendSignUp(email)
  }
)

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }: SignInForm) => {
    await Auth.signIn(email, password)
    return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
  }
)

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: ForgotPasswordForm) => {
    return await Auth.forgotPassword(email)
  }
)

export const resendForgotPassword = createAsyncThunk(
  "auth/resendForgotPassword",
  async ({ email }: ForgotPasswordForm) => {
    return await Auth.forgotPassword(email)
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, password }: ResetPasswordForm) => {
    return Auth.forgotPasswordSubmit(email, code, password)
  }
)

export const newPassword = createAsyncThunk(
  "auth/newPassword",
  async ({ email, password }: NewPasswordForm) => {
    await Auth.completeNewPassword(email, password)
    return ((await Auth.currentUserInfo()) as CognitoUserAmplify)?.attributes
  }
)

export const signOut = createAsyncThunk("auth/signOut", async () => {
  return Auth.signOut()
})
```

So, basically, what I did was to centralize all the thunks that we'll need for authentication into a single file to have a better view.

Next step is to add the logic for our reducer.

```typescript
import { createSlice, isAnyOf } from "@reduxjs/toolkit"

import { StoreStatus } from "../../common/types"
import {
  confirmSignUp,
  forgotPassword,
  newPassword,
  refreshToken,
  resendForgotPassword,
  resendSignUp,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../Auth.service"
import { AuthState } from "./Auth.types"

const initialState: AuthState = {
  isAuthenticated: false,
  message: "",
  status: StoreStatus.Idle,
  user: null,
}

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: () => ({
      ...initialState,
    }),
    resetStatus: (state) => ({
      ...state,
      status: StoreStatus.Idle,
    }),
    resetErrors: (state) => ({
      ...state,
      message: "",
      status: StoreStatus.Idle,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(confirmSignUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(resendSignUp.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Idle,
    }))
    builder.addCase(signIn.fulfilled, (state, { payload }) => ({
      ...state,
      status: StoreStatus.Succeeded,
      isAuthenticated: true,
      user: payload,
    }))
    builder.addCase(forgotPassword.fulfilled, () => ({
      ...initialState,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(resendForgotPassword.fulfilled, () => ({
      ...initialState,
      status: StoreStatus.Idle,
    }))
    builder.addCase(resetPassword.fulfilled, (state) => ({
      ...state,
      status: StoreStatus.Succeeded,
    }))
    builder.addCase(newPassword.fulfilled, (state, { payload }) => ({
      ...state,
      status: StoreStatus.Succeeded,
      user: payload,
    }))
    builder.addCase(signOut.fulfilled, () => initialState)
    builder.addCase(refreshToken.fulfilled, (state, { payload }) => ({
      ...state,
      user: payload,
      isAuthenticated: true,
      status: StoreStatus.Succeeded,
    }))

    // Handle pending & rejected requests
    builder.addMatcher(
      isAnyOf(
        signUp.pending,
        confirmSignUp.pending,
        resendSignUp.pending,
        signIn.pending,
        forgotPassword.pending,
        resendForgotPassword.pending,
        resetPassword.pending,
        newPassword.pending,
        signOut.pending,
        refreshToken.pending
      ),
      (state) => ({
        ...state,
        status: StoreStatus.Loading,
      })
    )
    builder.addMatcher(
      isAnyOf(
        signUp.rejected,
        confirmSignUp.rejected,
        resendSignUp.rejected,
        signIn.rejected,
        forgotPassword.rejected,
        resendForgotPassword.rejected,
        resetPassword.rejected,
        newPassword.rejected,
        signOut.rejected,
        refreshToken.rejected
      ),
      (state, { error }) => ({
        ...state,
        status: StoreStatus.Failed,
        message: error.message || "",
      })
    )
  },
})

export const { resetStatus, resetState, resetErrors } = AuthSlice.actions

export default AuthSlice.reducer
```

Now that we have set our reducer is time to use them in our custom UI.  
To do that we import from `/src/app/hooks.ts` file the `useAppDispatch` and use it like so:

```typescript
// SignIn.tsx

import { useAppDispatch } from "../../app/hooks"

const dispatch = useAppDispatch()

dispatch(/* Action calls like `signIn()` from our `Auth.service.ts` */)
```

And that's all you need to do beside the design part.

### 5. Conclusion

This should cover the basics for how to create the authentication flow in ReactJS using Amplify. The approach presented should be just fine for a start-up or a personal project, but if your application is growing you might need to implement a new flow with a better security.

Also, as a developer, I like to improve myself. So, if you have any questions or a better approach, don't hesitate to contact me.

Thanks for reading and happy coding!
