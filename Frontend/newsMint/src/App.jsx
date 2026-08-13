import { useState } from 'react'
import './App.css'
import LandingPage from './Components/Pages/LandingPage'
import AuthPages from './Components/Pages/AuthPages'
import {Route,Routes} from 'react-router-dom'
function App() {
  return (
    <>
      <Routes>
          <Route path='/' element={<LandingPage/> }/>
          <Route path='/authantication-page' element={<AuthPages/>}  />
      </Routes>
    </>
  )
}

export default App;
