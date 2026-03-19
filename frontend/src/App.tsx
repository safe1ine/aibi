import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
