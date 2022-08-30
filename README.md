# Amplify authentication with custom UI using ReactJS

In this article we'll going to cover the Amplify authentication with custom UI using ReactJS. It requires basic knowledge about react@18 with react-router-dom@6 and redux toolkit.

The application that I'm presenting to you can be find here: <GitHub.URL>

## Summary

1. [Configure Cognito](#Configure-Cognito)
2. [Initialize ReactJS app](#Initialize-ReactJS-app)
3. [Configure Amplify](#Configure-Amplify)
4. [Configure redux for authentication](#Configure-redux-for-authentication)
5. [Preform authentication](#Performe-authentication)
6. [Conclusion](#Conclusion)

## 1. Configure Cognito

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

## 2. Initialize ReactJS app

Before starting the react project make sure the Node version is the same to have a similar result as shown in this article or adapt it to your Node version: v16.16.0

To initialize the app use command:

```shell
npx create-react-app my-app --template redux-typescript
```

It will create a boilerplate from where you can start codding and don't have to worry about webpack or babel. All of it are preconfigured and hidden.

## 3. Configure Amplify

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

## 4. Configure redux for authentication

In the `src/feature` directory we are going to add the configuration for our state management.
In order to keep it simple I'm going to split each component to have its own state. But first, let's set up the API file.

Create a new file named `authAPI.ts` where we store all the interaction with the AWS Amplify.

```typescript
import { Auth, CognitoUser } from "@aws-amplify/auth"

import { ConfirmSignUpForm } from "../../components/ConfirmSignUp/ConfirmSignUp.types"
import { ForgotPasswordForm } from "../../components/ForgotPassword/ForgotPassword.types"
import { NewPasswordForm, ResetPasswordForm } from "../../components/ResetPassword/ResetPassword.types"
import { SignInForm } from "../../components/SignIn/SignIn.types"
import { SignUpForm } from "../../components/SignUp/SignUp.types"

export function amplifySignUp({ firstName, lastName, email, password }: SignUpForm) {
  return Auth.signUp({ username: email, password, attributes: { given_name: firstName, family_name: lastName } })
}

export function amplifyConfirmSignUp({ email, code }: ConfirmSignUpForm) {
  return Auth.confirmSignUp(email, code)
}

export function amplifyResendSignUp({ email }: ConfirmSignUpForm) {
  return Auth.resendSignUp(email)
}

export function amplifySignIn({ email, password }: SignInForm): Promise<CognitoUser | null> {
  return Auth.signIn(email, password)
}

export function amplifyForgotPassword({ email }: ForgotPasswordForm) {
  return Auth.forgotPassword(email)
}

export function amplifyResetPassword({ email, code, password }: ResetPasswordForm) {
  return Auth.forgotPasswordSubmit(email, code, password)
}

export function amplifyNewPassword({ email, password }: NewPasswordForm) {
  return Auth.completeNewPassword(email, password)
}

export function amplifySignOut() {
  return Auth.signOut()
}
```
