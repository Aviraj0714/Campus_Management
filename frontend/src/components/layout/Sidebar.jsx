import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import { IconButton } from '@mui/material'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/departments', label: 'Departments', icon: SchoolIcon },
    { path: '/subjects', label: 'Subjects', icon: MenuBookIcon },
    { path: '/students', label: 'Students', icon: PeopleIcon },
    { path: '/teachers', label: 'Teachers', icon: PersonIcon },
]

const Sidebar = ({ collapsed, onToggle }) => {
    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo Section */}
            <div className={`flex items-center p-4 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {collapsed ? (
                    <IconButton size="small" onClick={onToggle} className="text-gray-500">
                        <MenuIcon />
                    </IconButton>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-800 text-lg">AttendEase</h1>
                                <p className="text-xs text-gray-500">Classroom Management</p>
                            </div>
                        </div>
                        <IconButton size="small" onClick={onToggle} className="text-gray-500">
                            <ChevronLeftIcon />
                        </IconButton>
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        } ${collapsed ? 'justify-center' : ''}`
                                    }
                                >
                                    <Icon className="text-xl" />
                                    {!collapsed && <span className="font-medium">{item.label}</span>}
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">© 2026 AttendEase</p>
                </div>
            )}
        </aside>
    )
}

export default Sidebar
