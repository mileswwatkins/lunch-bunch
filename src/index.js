import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

// Wait until the Google Maps (and Places) libraries are loaded
window.initMap = () => {
  ReactDOM.render(<App />, document.getElementById('root'))
}
