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
    Chip,
    MenuItem,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import DataTable from '../components/ui/DataTable'
import { useData } from '../context/DataContext'

const Departments = () => {
    const { departments, addItem, updateItem, deleteItem } = useData()
    const [openModal, setOpenModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
    })

    // Generate unique code: DDMM_COURSENAME (e.g., 0202_MERN)
    const generateCode = (name, startDate) => {
        if (!startDate || !name) return ''
        const date = new Date(startDate)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        // Extract course abbreviation from name (first word or acronym)
        const courseCode = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '')
        return `${day}${month}_${courseCode}`
    }

    const columns = [
        { field: 'name', headerName: 'Department Name' },
        {
            field: 'code',
            headerName: 'Code',
            renderCell: (row) => (
                <span className="font-mono text-gray-700 lowercase">
                    {row.code?.toLowerCase()}
                </span>
            ),
        },
        {
            field: 'students',
            headerName: 'Students',
            renderCell: (row) => (
                <Chip
                    label={`${row.students || 0} students`}
                    size="small"
                    className="bg-primary-100 text-primary-700"
                />
            ),
        },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleOpenAdd = () => {
        setEditingId(null)
        setFormData({ name: '', startDate: '' })
        setOpenModal(true)
    }

    const handleEdit = (row) => {
        setEditingId(row.id)
        setFormData({ name: row.name, startDate: row.startDate || '' })
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
        setEditingId(null)
        setFormData({ name: '', startDate: '' })
    }

    const handleSubmit = () => {
        const code = generateCode(formData.name, formData.startDate)
        const submitData = {
            name: formData.name,
            code: code,
            startDate: formData.startDate,
        }

        if (editingId) {
            updateItem('departments', editingId, submitData)
        } else {
            addItem('departments', { ...submitData, students: 0 })
        }
        handleClose()
    }

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
            deleteItem('departments', row.id)
        }
    }

    // Preview the generated code
    const previewCode = generateCode(formData.name, formData.startDate)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Departments
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                        Manage your academic departments
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                    Add Department
                </Button>
            </div>

            {/* Department List */}
            <Paper
                elevation={0}
                className="p-6 rounded-2xl border border-gray-100"
            >
                <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                    Department List
                </Typography>
                <DataTable
                    columns={columns}
                    data={departments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Paper>

            {/* Add/Edit Department Modal */}
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
                            {editingId ? 'Edit Department' : 'Add New Department'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {editingId ? 'Update department details' : 'Create a new academic department'}
                        </Typography>
                    </div>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="pt-6">
                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            name="name"
                            label="Department Name"
                            placeholder="e.g. MERN Stack"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            name="startDate"
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Code Preview */}
                        {previewCode && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <Typography variant="body2" className="text-gray-500 mb-1">
                                    Generated Code:
                                </Typography>
                                <Typography variant="h6" className="font-mono text-primary-600">
                                    {previewCode}
                                </Typography>
                                <Typography variant="caption" className="text-gray-400">
                                    Format: DDMM_COURSENAME
                                </Typography>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions className="p-6 pt-0">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.startDate}
                        className="bg-primary-500 hover:bg-primary-600 py-3"
                    >
                        {editingId ? 'Update Department' : 'Create Department'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Departments
