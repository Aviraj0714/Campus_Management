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
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import DataTable from '../components/ui/DataTable'
import { useData } from '../context/DataContext'

const Subjects = () => {
    const { subjects, departments, addItem, updateItem, deleteItem } = useData()
    const [openModal, setOpenModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: '',
        quarter: '',
        department: '',
        credits: '',
    })

    const columns = [
        { field: 'name', headerName: 'Subject Name' },
        {
            field: 'code',
            headerName: 'Code',
            renderCell: (row) => <span className="lowercase">{row.code?.toLowerCase()}</span>
        },
        {
            field: 'type',
            headerName: 'Type',
            renderCell: (row) => (
                <Chip
                    label={row.type}
                    size="small"
                    className={
                        row.type === 'Theory'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                    }
                />
            ),
        },
        { field: 'department', headerName: 'Department' },
        { field: 'credits', headerName: 'Credits' },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleOpenAdd = () => {
        setEditingId(null)
        setFormData({ name: '', code: '', type: '', quarter: '', department: '', credits: '' })
        setOpenModal(true)
    }

    const handleEdit = (row) => {
        setEditingId(row.id)
        setFormData({
            name: row.name,
            code: row.code,
            type: row.type,
            quarter: row.quarter || '',
            department: row.department,
            credits: row.credits,
        })
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
        setEditingId(null)
        setFormData({ name: '', code: '', type: '', quarter: '', department: '', credits: '' })
    }

    const handleSubmit = () => {
        const submitData = { ...formData, credits: parseInt(formData.credits) || 0 }
        if (editingId) {
            updateItem('subjects', editingId, submitData)
        } else {
            addItem('subjects', submitData)
        }
        handleClose()
    }

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
            deleteItem('subjects', row.id)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Subjects
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                        Manage courses and subjects
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                    Add Subject
                </Button>
            </div>

            {/* Subject List */}
            <Paper
                elevation={0}
                className="p-6 rounded-2xl border border-gray-100"
            >
                <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                    Subject List
                </Typography>
                <DataTable
                    columns={columns}
                    data={subjects}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Paper>

            {/* Add/Edit Subject Modal */}
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
                            {editingId ? 'Edit Subject' : 'Add New Subject'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {editingId ? 'Update subject details' : 'Create a subject for a department'}
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
                                label="Subject Name"
                                placeholder="e.g. React Fundamentals"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                name="code"
                                label="Subject Code"
                                placeholder="e.g. REACT101"
                                value={formData.code}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                select
                                name="type"
                                label="Type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <MenuItem value="Theory">Theory</MenuItem>
                                <MenuItem value="Practical">Practical</MenuItem>
                                <MenuItem value="Online">Online</MenuItem>
                                <MenuItem value="Classroom">Classroom</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                select
                                name="quarter"
                                label="Quarter"
                                value={formData.quarter}
                                onChange={handleChange}
                            >
                                <MenuItem value="Q1">Quarter 1</MenuItem>
                                <MenuItem value="Q2">Quarter 2</MenuItem>
                                <MenuItem value="Q3">Quarter 3</MenuItem>
                                <MenuItem value="Q4">Quarter 4</MenuItem>
                            </TextField>
                        </div>
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
                            name="credits"
                            label="Credits"
                            type="number"
                            placeholder="e.g. 3"
                            value={formData.credits}
                            onChange={handleChange}
                        />
                    </div>
                </DialogContent>
                <DialogActions className="p-6 pt-0">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        className="bg-primary-500 hover:bg-primary-600 py-3"
                    >
                        {editingId ? 'Update Subject' : 'Create Subject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Subjects
