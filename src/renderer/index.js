/// <reference types="hypermerge/src/types/hyperswarm" />

// You need to whitelist every newly added module inside electron-webpack.json
// Relevant thread: https://github.com/expo/expo-cli/issues/2835#issuecomment-722952296

import '@/env'

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Root from './components/Root'


ReactDOM.render(<Root />, document.getElementById('app'))
