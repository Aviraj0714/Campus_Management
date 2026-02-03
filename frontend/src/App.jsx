import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Departments from './pages/Departments'
import Subjects from './pages/Subjects'
import Teachers from './pages/Teachers'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="departments" element={<Departments />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="teachers" element={<Teachers />} />
            </Route>
        </Routes>
    )
}

export default App
