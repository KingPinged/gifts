import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GiftPage from './pages/GiftPage'
import NotFoundPage from './pages/NotFoundPage'
import './styles.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/gift/:id" element={<GiftPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
