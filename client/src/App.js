import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Home from './components/Home.js'

const App = () => {
	return (
		<div>
			<BrowserRouter>
                <Routes>
                	<Route exact path="/" element={<Home />} />
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/register" element={<Register />} />
                </Routes>
			</BrowserRouter>
		</div>
	)
}

export default App