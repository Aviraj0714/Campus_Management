import { useState } from 'react'
import {
    Typography,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    MenuItem,
    Chip,
    Avatar,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import DataTable from '../components/ui/DataTable'
import { useData } from '../context/DataContext'

const Teachers = () => {
    const { teachers, departments, addItem, updateItem, deleteItem } = useData()
    const [openModal, setOpenModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        username: '',
        password: '',
    })

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return ''
        const words = name.split(' ')
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            renderCell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        sx={{ width: 32, height: 32, fontSize: 12 }}
                        className="bg-primary-100 text-primary-700"
                    >
                        {getInitials(row.name)}
                    </Avatar>
                    <span>{row.name}</span>
                </div>
            ),
        },
        { field: 'email', headerName: 'Email' },
        { field: 'department', headerName: 'Department' },
        {
            field: 'status',
            headerName: 'Status',
            renderCell: (row) => (
                <Chip
                    label={row.status || 'Active'}
                    size="small"
                    className={
                        row.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                    }
                />
            ),
        },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleOpenAdd = () => {
        setEditingId(null)
        setFormData({ name: '', email: '', department: '', username: '', password: '' })
        setOpenModal(true)
    }

    const handleEdit = (row) => {
        setEditingId(row.id)
        setFormData({
            name: row.name,
            email: row.email,
            department: row.department,
            username: row.username || '',
            password: '',
        })
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
        setEditingId(null)
        setFormData({ name: '', email: '', department: '', username: '', password: '' })
    }

    const handleSubmit = () => {
        const submitData = { ...formData, status: 'Active' }
        if (!editingId) {
            delete submitData.password // Don't store password in demo
        }
        if (editingId) {
            updateItem('teachers', editingId, submitData)
        } else {
            addItem('teachers', submitData)
        }
        handleClose()
    }

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
            deleteItem('teachers', row.id)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Teachers
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                        Manage faculty members
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                    Add Faculty
                </Button>
            </div>

            {/* Faculty List */}
            <Paper
                elevation={0}
                className="p-6 rounded-2xl border border-gray-100"
            >
                <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                    Faculty List
                </Typography>
                <DataTable
                    columns={columns}
                    data={teachers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Paper>

            {/* Add/Edit Teacher Modal */}
            <Dialog
                open={openModal}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: 'rounded-2xl',
                }}
            >
                <DialogTitle className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <Typography variant="h6" className="font-semibold">
                            {editingId ? 'Edit Teacher' : 'Add New Teacher'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {editingId ? 'Update teacher details' : 'Create a teacher account with login credentials'}
                        </Typography>
                    </div>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="pt-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                name="name"
                                label="Full Name"
                                placeholder="Prof. John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                name="email"
                                label="Email"
                                placeholder="john@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                select
                                name="department"
                                label="Department"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.code} value={dept.code}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                name="username"
                                label="Username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        {!editingId && (
                            <TextField
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                </DialogContent>
                <DialogActions className="p-6 pt-0">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        className="bg-primary-500 hover:bg-primary-600 py-3"
                    >
                        {editingId ? 'Update Teacher' : 'Create Teacher Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Teachers
