import { useState, useRef } from 'react'
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
    Alert,
    Snackbar,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material'
import DataTable from '../components/ui/DataTable'
import { useData } from '../context/DataContext'

const Students = () => {
    const { students, departments, addItem, updateItem, deleteItem } = useData()
    const [openModal, setOpenModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const fileInputRef = useRef(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        rollNumber: '',
    })

    const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'department', headerName: 'Department' },
        { field: 'rollNumber', headerName: 'Roll Number' },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleOpenAdd = () => {
        setEditingId(null)
        setFormData({ name: '', email: '', department: '', rollNumber: '' })
        setOpenModal(true)
    }

    const handleEdit = (row) => {
        setEditingId(row.id)
        setFormData({
            name: row.name,
            email: row.email,
            department: row.department,
            rollNumber: row.rollNumber || '',
        })
        setOpenModal(true)
    }

    const handleClose = () => {
        setOpenModal(false)
        setEditingId(null)
        setFormData({ name: '', email: '', department: '', rollNumber: '' })
    }

    const handleSubmit = () => {
        if (editingId) {
            updateItem('students', editingId, formData)
        } else {
            addItem('students', formData)
        }
        handleClose()
    }

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
            deleteItem('students', row.id)
        }
    }

    // CSV Upload Handler
    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            const lines = text.split('\n').filter(line => line.trim())

            if (lines.length < 2) {
                setSnackbar({ open: true, message: 'CSV file is empty or invalid', severity: 'error' })
                return
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
            const requiredHeaders = ['name', 'email', 'department', 'rollnumber']

            // Check headers
            const hasAllHeaders = requiredHeaders.every(h =>
                headers.includes(h) || headers.includes(h.replace('rollnumber', 'rollNumber'))
            )

            if (!hasAllHeaders) {
                setSnackbar({
                    open: true,
                    message: 'CSV must have headers: name, email, department, rollNumber',
                    severity: 'error'
                })
                return
            }

            let importedCount = 0
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim())
                if (values.length >= 4) {
                    const student = {
                        name: values[headers.indexOf('name')],
                        email: values[headers.indexOf('email')],
                        department: values[headers.indexOf('department')],
                        rollNumber: values[headers.indexOf('rollnumber')] || values[headers.indexOf('rollNumber')],
                    }
                    if (student.name && student.email) {
                        addItem('students', student)
                        importedCount++
                    }
                }
            }

            setSnackbar({
                open: true,
                message: `Successfully imported ${importedCount} students!`,
                severity: 'success'
            })
        }
        reader.readAsText(file)

        // Reset file input
        event.target.value = ''
    }

    const handleDownloadTemplate = () => {
        window.open('/demo_students.csv', '_blank')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Students
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                        Manage student records and enrollments
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                    Add Student
                </Button>
            </div>

            {/* Bulk Import Section */}
            <Paper
                elevation={0}
                className="p-6 rounded-2xl border border-gray-100"
            >
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-semibold text-gray-800">
                        Bulk Import
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                        className="text-primary-500"
                    >
                        Download Template CSV
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon className="text-gray-400 text-5xl mb-3" />
                    <Typography variant="body1" className="text-gray-600 mb-1">
                        Drag and drop your CSV file here
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        or click to browse (CSV format: name, email, department, rollNumber)
                    </Typography>
                </div>
            </Paper>

            {/* Student Directory */}
            <Paper
                elevation={0}
                className="p-6 rounded-2xl border border-gray-100"
            >
                <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                    Student Directory ({students.length} students)
                </Typography>
                <DataTable
                    columns={columns}
                    data={students}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Paper>

            {/* Add/Edit Student Modal */}
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
                            {editingId ? 'Edit Student' : 'Add New Student'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {editingId ? 'Update student details' : 'Create a student account'}
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
                            label="Full Name"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            name="email"
                            label="Email"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
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
                            name="rollNumber"
                            label="Roll Number"
                            placeholder="e.g. MERN2024001"
                            value={formData.rollNumber}
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
                        {editingId ? 'Update Student' : 'Create Student Account'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    className="rounded-xl"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Students
