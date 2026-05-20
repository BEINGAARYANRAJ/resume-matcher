
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import JobMatches from './pages/JobMatches'
import { ResumeUpload } from './pages/ResumeUpload'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/matches" element={<JobMatches />} />
      </Routes>
    </BrowserRouter>
  )
}