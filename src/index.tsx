import 'primeicons/primeicons.css' //icons
import 'primereact/resources/primereact.min.css' //core css
import 'primereact/resources/themes/md-light-indigo/theme.css' //theme
import './app/aws-config' // amplify auth init
import './index.css'
import '/node_modules/primeflex/primeflex.css' // flex

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import { store } from './app/store'
import reportWebVitals from './reportWebVitals'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
