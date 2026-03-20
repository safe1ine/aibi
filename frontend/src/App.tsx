import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AppLayout from './components/AppLayout'
import Chat from './pages/Chat'
import DataSources from './pages/DataSources'
import LLM from './pages/LLM'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="datasources" element={<DataSources />} />
          <Route path="llm" element={<LLM />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
