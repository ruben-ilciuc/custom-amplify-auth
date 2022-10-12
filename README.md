# How to create a custom UI authentication with React using Amplify

In this article we'll going to cover how to implement a custom UI for the authentication with Cognito in a React app using the Amplify library. It requires basic knowledge about **react@18** and **redux toolkit**.

You can find the final code here: [custom-amplify-auth](https://github.com/ruben-ilciuc/custom-amplify-auth)

## ! IMPORTANT

Please, take into consideration that this approach is **NOT** fully secured since you store the `idToken`, `accessToken`, `refreshToken` and other sensitive information about the user in the Local Storage. This opens the door for **XXS** and **CSRF** attacks. [See this conversation for more details](https://github.com/aws-amplify/amplify-js/issues/3224)

## Summary

- [How to create a custom UI authentication with React using Amplify](#how-to-create-a-custom-ui-authentication-with-react-using-amplify)
  - [! IMPORTANT](#-important)
  - [Summary](#summary)
  - [1. Configure Cognito](#1-configure-cognito)
  - [2. Initialize ReactJS app](#2-initialize-reactjs-app)
  - [3. Configure Amplify](#3-configure-amplify)
  - [4. Authentication components](#4-authentication-components)
    - [Sign up](#sign-up)
    - [Sign Up Confirmation](#sign-up-confirmation)
    - [Resend Confirmation Code](#resend-confirmation-code)
    - [Sign In](#sign-in)
    - [Forgot Password](#forgot-password)
    - [Reset Password](#reset-password)
    - [Sign Out](#sign-out)
    - [Refresh Token](#refresh-token)
    - [Private Page](#private-page)
  - [5. Conclusion](#5-conclusion)

## 1. Configure Cognito

Before configuring the Cognito you need to create an account in Amazon AWS. For creating the account you need to provide credit card information for validation and they will charge you 1.00 USD. But don't worry, you'll get the money back in 3-5 business days and you'll get a free tier for a year.

In order to keep this article short I wont go through Cognito configuration step by step, but I will give you an overview of my configuration:

| Option                                               | Value                                                                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Cognito user pool sign-in options                    | **Email**                                                                                                                                    |
| Password policy                                      | **Default**                                                                                                                                  |
| Multi-factor authentication                          | **No MFA**                                                                                                                                   |
| User account recovery                                | **Default**                                                                                                                                  |
| Self-service sign-up                                 | **Default** _(we want users to be able to sign-up by themselves)_                                                                            |
| Attribute verification and user account confirmation | **Default**                                                                                                                                  |
| Required attributes                                  | **given_name, family_name** _(keep in mind that these attributes we need to provide them in our Sign Up component)_                          |
| Custom attributes                                    | **None** _(you can add if you need)_                                                                                                         |
| Configure message delivery                           | **Send email with Cognito** _(The preferred option is SES, but see [PRICING](https://aws.amazon.com/ses/pricing) first to avoid surcharges)_ |
| User Pool name                                       | **demo-auth** _(use your imagination)_                                                                                                       |
| Hosted authenticaton pages                           | **Unselected** _(we use our custom design)_                                                                                                  |
| Initial app client                                   | **Default**                                                                                                                                  |
| Advanced app client settings                         | _Authentication flow:_ **ALLOW_REFRESH_TOKEN_AUTH, ALLOW_USER_PASSWORD_AUTH, ALLOW_USER_SRP_AUTH** _else_ **Default**                        |

## 2. Initialize ReactJS app

Before starting the react project make sure the Node version is the same as mine to have a similar result as shown in this article otherwise adapt it to your Node version: `v16.16.0`

To initialize the app use command:

```shell
npx create-react-app my-app --template redux-typescript
```

It will create a boilerplate from where you can start codding and don't have to worry about webpack or babel. All of them are pre configured and hidden.

## 3. Configure Amplify

Install the amplify package using the command:

```shell
npm install @aws-amplify/auth
```

In the `src/app` directory create a new file `aws-config.ts` where we configure the amplify library to use our Cognito user pool for authentication.

```typescript
import { Auth } from '@aws-amplify/auth'

Auth.configure({
  region: process.env.REACT_APP_REGION,
  userPoolId: process.env.REACT_APP_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  mandatorySignIn: true,
  authenticationFlowType: 'USER_PASSWORD_AUTH',
})
```

Here, the amplify library creates a connection with our Cognito and provides us APIs which we will use to build our custom authentication UI.

In order to access those APIs, it needs to be initialized at the start of our application. So, in the `index.tsx` at the top add the next line:

```typescript
import './app/aws-config' // amplify auth init
```

Last but not least, create a file in the root directory named `.env` and add:

```properties
REACT_APP_USER_POOL_ID=<ADD_YOUR_USER_POOL_ID>
REACT_APP_CLIENT_ID=<ADD_YOUR_CLIENT_ID>
REACT_APP_REGION=<ADD_YOUR_REGION>
```

Now, our application is fully configured and ready to use amplify for authentication. The only part that our application needs is the authentication UI.

## 4. Authentication components

In the `src/feature` directory we are going to add the configuration for our state management.

Create a new directory `Auth` and inside it, create the following files:

- `Auth.service.ts` - In here we'll create our thunk functions
- `Auth.slice.ts` - In here we'll add the logic for our reducer
- `Auth.types.ts` - This is optional, I created it to have a separate file where my custom types will be stored

Now, let's continue with the auth flow. I'll go step by step starting with:

### Sign up

- **First, create our thunk function in the `Auth.service.ts`**

```typescript
export const signUp = createAsyncThunk('auth/signUp', async ({ email, password, firstName, lastName }: SignUpForm) => {
  return Auth.signUp({
    username: email,
    password,
    attributes: { given_name: firstName, family_name: lastName },
  })
})
```

Since we added `given_name` and `family_name` as attributes to our Cognito we need to provide them as part of the user creation, otherwise Cognito won't let us create the user.  
For more information see [Amplify Sign Up documentation](https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-up).

- **Secondly, create the logic for our Sign Up thunk in our reducer file `Auth.slice.ts`**

Our initial state will have a `message` prop to provide some feedback to the user, `status` which will have 4 states `Idle, Loading, Failed, Succeeded`, `user` for which I had to create a custom type for, because the library doesn't provide any, along with `isAuthenticated`.

```typescript
const initialState: AuthState = {
  isAuthenticated: false,
  message: '',
  status: StoreStatus.Idle, // I created an enum with all 4 states for consistency
  user: null,
}

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
})
```

Now, let's build our use cases as extraReducers.

```typescript
[...]
extraReducers: (builder) => {
  // Successful response
  builder.addCase(signUp.fulfilled, (state) => ({
    ...state,
    message: 'Your account is registered. Please check your email for activation instructions.',
    status: StoreStatus.Succeeded,
  }))
  // For pending & rejected requests I added a matcher, because
  // it will have the same logic for all the requests
  builder.addMatcher(isAnyOf(signUp.pending), () => ({
    ...initialState,
    status: StoreStatus.Loading,
  }))
  builder.addMatcher(isAnyOf(signUp.rejected), (state, { error }) => ({
    ...state,
    status: StoreStatus.Failed,
    message: error.message || '',
  }))
},
```

So, when the sign up request succeeded we set a message and a status. Same when the request failed.  
And to show the feedback to the user we'll create a custom component specific for that. But we'll get there later.

When the request is in pending we want to reset the state and set the status to `Loading`.

- **Third, it's time to use our _signUp_ thunk**

Create a new directory in the `src` called `pages`. In this directory we'll add all the pages we need.  
So, create `SignUp.tsx` file _(you can name it as you wish)_ and design the form as you like. But remember the first step: we need to have `family_name`, `given_name`, `email` and `password` fields in order to create an user in Cognito.

After the design is done, we need to get the dispatch hook from `/src/app/hooks`.

```typescript
const dispatch = useAppDispatch()
```

And on submit form we call the signUp thunk like so:

```typescript
dispatch(signUp(data))
```

This way we fire the Sign Up process. Amplify will send a request to the Cognito and if all the requirements are passed it will return a data object.

If the request succeeded or failed we should have a message and a status in our redux state. To display the message to the user I created a custom component which will be displayed every time a message is present in the redux state.

In the `/src/components` create a `Message.tsx` file and import the `useAppSelector` hook.

```typescript
import { useAppSelector } from '../app/hooks'
```

To use it we do something like:

```typescript
const { message, status } = useAppSelector((state) => state.auth)
```

Well, it depends on what you store. In our care `state.auth` is an object that has message and status as properties; in this case we can destruct the `auth` object and get what we need from it.

I'm using [PrimeReact](https://www.primefaces.org/primereact) as UI Components and they have a `Message` component and it has states (severity as they call it): _success, info, warn, error_.

And this custom component will be imported in all our components where feedback is needed otherwise you can import it once in the `App.tsx`.

- **Create a route for this page**

In the `App.tsx` create a router and add the Sign Up component.

```tsx
<Routes>
  <Route path="/sign-up" element={<SignUp />} />
</Routes>
```

Now, that we have Sign Up component ready to go we also need to confirm the user. So, for that we need another page.

### Sign Up Confirmation

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const confirmSignUp = createAsyncThunk('auth/confirmSignUp', async ({ email, code }: ConfirmSignUpForm) => {
  return Auth.confirmSignUp(email, code)
})
```

As we selected in the AWS Cognito (_Cognito user pool sign-in options_), the code to confirm the registration is sent to the email.  
Here we could choose to send a link instead of code, but then we were not able to add a custom design for it.

- **Secondly, create the logic for Sign Up Confirmation thunk in our reducer file `Auth.slice.ts`**

Since we already have the reducer initialized, the only thing we have to do is to create the logic for Sign Up Confirmation.

```typescript
[...]
extraReducers: (builder) => {
  // Successful response
  [...]
  builder.addCase(confirmSignUp.fulfilled, (state) => ({
    ...state,
    message: 'Account confirmed.',
    status: StoreStatus.Succeeded,
  }))
  // For pending & rejected requests I added a matcher, because
  // it will have the same logic for all the requests
  builder.addMatcher(isAnyOf(signUp.pending, confirmSignUp.pending), () => ({
    ...initialState,
    status: StoreStatus.Loading,
  }))
  builder.addMatcher(isAnyOf(signUp.rejected, confirmSignUp.rejected), (state, { error }) => ({
    ...state,
    status: StoreStatus.Failed,
    message: error.message || '',
  }))
},
```

From now on this part will be simple. We just have to build the case for succeeded request for our thunk function and append the thunk as parameter in the `isAnyOf` function followed by `.pending` or `.rejected`.

- **Third, let's use our _confirmSignUp_ thunk**

Create a new page for confirmation which will have a form where user can input the code. But, in order to confirm the user we also need the email.

So, in the Sign Up page we have to send the email to the new Sign Up Confirmation page.

```typescript
useEffect(() => {
  if (status === StoreStatus.Succeeded) {
    navigate('/confirm', { state: { email: formData?.email } })
  }
}, [formData?.email, navigate, status])
```

My approach here is to navigate (_see [useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)_) to the Sign Up Confirm page and send the email field from the form data as state when the status of the request succeeded.

Now in the Sign Up Confirm page we can get the email by using the [useNavigate](https://reactrouter.com/en/main/hooks/use-location) hook from `react-router-dom`.

```typescript
;(location.state as Record<string, string>)?.email
```

I had to enforce the type for location.state as `Record`, because it has `unknown` type by default.

Now, when the user submits the confirmation code we call the `confirmSignUp` thunk function.

```typescript
dispatch(
  confirmSignUp({
    email: (location.state as Record<string, string>)?.email,
    code: data.code,
  }),
)
  .then((res) => {
    if (res.type === 'fulfilled') {
      navigate('/', { replace: true })
    }
  })
  .catch(console.error)
```

Here, I'm checking if the request succeeded and redirect the user to the Sign In page.

On this page you can restrict the user from accessing it if there is no email. I recommend you to do that.

- **Create a route for this page**

In the `App.tsx` add a new route for Sign Up Confirmation page.

```tsx
[...]
<Route path="/confirm" element={<ConfirmSignUp />} />
```

Another nice thing is being able to resend the confirmation code.

### Resend Confirmation Code

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const resendSignUp = createAsyncThunk('auth/resendSignUp', async ({ email }: { email: string }) => {
  return Auth.resendSignUp(email)
})
```

To resend the confirmation code to the user we need the email. From there cognito will take care of sending the new confirmation code.

- **Secondly, create the logic for Resend Sign Up thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(resendSignUp.fulfilled, (state) => ({
  ...state,
  message: 'Please check your email for activation instructions.',
  status: StoreStatus.Succeeded,
}))
```

When the resend request succeeded we just show to the user a message that the confirmation instructions are sent to the email. For pending and rejected there is not much to do, just append as parameter in the `isAnyOf` function (e.g. _resendSignUp.pending_).

- **Third, let's use _resendSignUp_ thunk**

In the Sign Up Confirmation page add a link and an onClick event where we dispatch our thunk function.

```typescript
dispatch(
  resendSignUp({
    email: String((location.state as Record<string, string>)?.email),
  }),
)
```

That's all we need for signing up a new account in our application.

### Sign In

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }: SignInForm) => {
  const cognitoUser: CognitoUserAmplify = await Auth.signIn(email, password)
  return cognitoUser.attributes
})
```

I had to add a custom type, because the Auth.signIn returns an `any` promise. To see all the attributes just log the `cognitoUser` variable.  
There is also a method you can call to get the attributes `getUserAttributes` or `getUserData`, but it takes a callback function and returns void which, in our case, is not feasible. We need to return the user data from our thunk function to the reducer to be able to store it in the redux for later use.

- **Secondly, create the logic for Sign In thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(signIn.fulfilled, (state, { payload }) => ({
  ...state,
  status: StoreStatus.Succeeded,
  isAuthenticated: true,
  user: payload,
}))
```

Once we get the user attributes from the response we should set the user data and mark as authenticated.

- **Third, let's use _signIn_ thunk**

Create a new page for Sign In with email and password and on form submit dispatch the thunk function.

```typescript
dispatch(signIn(data))
```

After sending a request to the Cognito we can get few different responses:

1. Status code `400` and a message: `User is not confirmed.`
2. Status code `200` and a challengeName (_see [DOCS](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html)_) ~ I won't touch this part since this article is already long enough ~
3. Status code `200` and a promise resolves the CognitoUser from where we can extract the user attributes.

For `User is not confirmed.` case we want to redirect the user to confirm it's account and not just show him the message.

```typescript
useEffect(() => {
  if (message === 'User is not confirmed.') {
    navigate('/confirm', { state: { email: formData?.email } })
  }
}, [formData?.email, message, navigate, status])
```

So, I added an useEffect and check in the message if the user is not confirmed and redirect to `/confirm` page along with the email.  
Simple as that.

For `200` case I just redirect the user to a private page where the user has to be logged in to get access.

The final result will look something like this:

```typescript
useEffect(() => {
  if (message === 'User is not confirmed.') {
    navigate('/confirm', { state: { email: formData?.email } })
  }
  if (isAuthenticated) {
    navigate('/private')
  }
}, [formData?.email, message, navigate, status, isAuthenticated])
```

- **Create a route for this page**

In the `App.tsx` add a new route for Sign In page.

```tsx
[...]
<Route index element={<SignIn />} />
```

Next thing to do will be to implement the ability to reset the password if the user forgets it.

### Forgot Password

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }: ForgotPasswordForm) => {
  return await Auth.forgotPassword(email)
})
```

To reset the password for an account we just need the email.

- **Secondly, create the logic for Forgot Password thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(forgotPassword.fulfilled, () => ({
  ...initialState,
  status: StoreStatus.Succeeded,
}))
```

I added the `initialState` instead of `state` because I wanted to make sure that the redux is clean and the `message` is not carried to the next page.

- **Third, let's use _forgotPassword_ thunk**

Create a new page for Forgot Password and add a simple input for the email. When the user hits submit dispatch the thunk function.

```typescript
dispatch(forgotPassword(data))
```

Cognito will take care from here and will send a unique code to that email.
And if the request succeeded just redirect to the Reset Password page. We don't have that page yet, but don't worry. We'll get there.

```typescript
useEffect(() => {
  if (status === StoreStatus.Succeeded) {
    navigate('/reset-password', { state: formData })
  }
}, [dispatch, formData, navigate, status])
```

- **Create a route for this page**

In the `App.tsx` add a new route for Forgot Password page.

```tsx
[...]
<Route path="/forgot-password" element={<ForgotPassword />} />
```

Last thing, in the Sign In page add a new link that redirects the user to Forgot Password page.

### Reset Password

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, code, password }: ResetPasswordForm) => {
  return Auth.forgotPasswordSubmit(email, code, password)
})
```

To reset the password we need the email, the code that Cognito just sent and a new password that matches the requirements specified in Cognito when we created the User Pool.

- **Secondly, create the logic for Reset Password thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(resetPassword.fulfilled, (state) => ({
  ...state,
  status: StoreStatus.Succeeded,
}))
```

Here just update the status, else as usual, update the `isAnyOf` function for reject and pending.

- **Third, let's use _resetPassword_ thunk**

Same as on `/confirm` page, check if the email exists in the state, otherwise redirect to Sign In page.

Here we need a `code` field and a `password` field and when the user submits the form dispatch the thunk function.

```typescript
dispatch(
  resetPassword({
    email: data.email,
    code: String(data.code.match(/(\d)+/g)?.join('')),
    password: data.password,
    confirmPassword: data.confirmPassword,
  }),
)
  .then((res) => {
    if (res.type === 'fulfilled') {
      navigate('/', { replace: true })
    }
  })
  .catch(console.error)
```

I'm checking if the request succeeded and redirect the user to the Sign In page.

Here I used the `replace: true` option to restrict the user from going back and add a different password. Of course, Cognito won't let the user to add the password, but why give them the opportunity to do that?!

- **Create a route for this page**

In the `App.tsx` add a new route for Reset Password page.

```tsx
[...]
<Route path="/reset-password" element={<ResetPassword />} />
```

### Sign Out

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const signOut = createAsyncThunk('auth/signOut', async () => {
  return Auth.signOut()
})
```

For sign out I created a thunk to be able to remove all the state from reducer. Also, if you need to revoke all the sessions you might want to add `{ global: true }` as parameter to the `Auth.signOut` method.

- **Secondly, create the logic for Sign Out thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(signOut.fulfilled, () => initialState)
```

- **Third, let's use _signOut_ thunk**

To use it just call it anywhere you need. It can be on a button click.

```typescript
dispatch(signOut()).then(() => navigate('/', { replace: true }))
```

### Refresh Token

- **First, create the thunk function in the `Auth.service.ts`**

```typescript
export const refreshToken = createAsyncThunk('auth/refreshToken', async () => {
  const cognitoUser: CognitoUserAmplify = await Auth.currentAuthenticatedUser()
  return cognitoUser?.attributes
})
```

`currentAuthenticatedUser` will get the user data from localStorage. If the access token is expired it will make a request to Cognito which will refresh the token for you. So, using Amplify you don't have to put too much effort in it. It work out of the box.  
Here you also have the option to instruct Amplify to get a new token directly from Cognito without checking the localStorage first just by adding `{ bypassCache: true }` as parameter to `currentAuthenticatedUser` method.

But we'll keep it as it is to have a faster response.

- **Secondly, create the logic for Refresh Token thunk in the reducer file `Auth.slice.ts`**

```typescript
builder.addCase(refreshToken.fulfilled, (state, { payload }) => ({
  ...state,
  user: payload,
  isAuthenticated: true,
  status: StoreStatus.Succeeded,
}))
```

We are going to use the refresh token thunk every time our application is rendered. In order to keep the user authenticated in our application we need to set the user attributes in the reducer, because when the page is refreshed we lose all the data from redux.

```typescript
builder.addCase(refreshToken.rejected, (state) => ({
  ...state,
  status: StoreStatus.Failed,
}))
```

I created a separate case for rejected response, because I didn't want to set also the message for it. The reason for it was that it checks if the user is authenticated, and if not, it will set a message that the user is not authenticated, even though the user just got there.  
Make sure that this case is before the `builder.addMatcher`. Otherwise you'll get an error message like:
`` builder.addCase` should only be called before calling `builder.addMatcher ``

- **Third, let's use _refreshToken_ thunk**

In the `App.tsx` function create a new useEffect and call the refreshToken thunk function.

```typescript
useEffect(() => {
  dispatch(refreshToken())
}, [dispatch])
```

This way we make sure that when the user refreshes the page will refresh token if it is expired and set as authenticated.

### Private Page

The only thing we need to do in the private page is to check if the user is NOT authenticated and redirect to Sign In page.

```typescript
useEffect(() => {
  if (!isAuthenticated && [StoreStatus.Succeeded, StoreStatus.Failed].includes(status)) {
    navigate('/')
  }
}, [isAuthenticated, navigate, status])
```

I had to check also the status if it succeeded or failed, otherwise the user will be redirected to Sign In page every time a page refresh is made. The reason for that is the delay for getting the user data and the initial state of the reducer. Which is set to be `isAuthenticated = false`.

And, here you go, you have a functional authentication app using Amplify with custom UI.

---

## 5. Conclusion

This should cover the basics for how to create the authentication flow in ReactJS using Amplify. The approach presented should be just fine for a start-up or a personal project, but if your application is growing you might need to implement a different flow including a back-end service with better security. Favor a way where the front-end has no rights to access or modify the access and refresh tokens.

Also, as a developer, I like to improve myself. So, if you have any suggestions/questions don't hesitate to contact me.

Thanks for reading and happy coding!
