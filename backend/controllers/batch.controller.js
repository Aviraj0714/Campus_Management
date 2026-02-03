const Batch = require('../models/Batch.model');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private/Admin/Manager
const getBatches = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const query = {};

        // Role-based filtering
        if (req.user.role === 'MANAGER') {
            query.createdBy = req.user._id;
        } else if (req.user.role === 'LEARNER') {
            query._id = { $in: req.user.assignedBatches };
        }

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { clientName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const batches = await Batch.find(query)
            .populate('learners', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Batch.countDocuments(query);

        res.status(200).json({
            success: true,
            count: batches.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: batches
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private
const getBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('learners', 'firstName lastName email phone')
            .populate('createdBy', 'firstName lastName email');

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check access permissions
        if (!hasBatchAccess(req.user, batch)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this batch'
            });
        }

        res.status(200).json({
            success: true,
            data: batch
        });
    } catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create batch
// @route   POST /api/batches
// @access  Private/Admin/Manager
const createBatch = async (req, res) => {
    try {
        const { learners, ...batchData } = req.body;

        // Set created by
        batchData.createdBy = req.user._id;

        // Validate learners if provided
        if (learners && learners.length > 0) {
            const learnerUsers = await User.find({
                _id: { $in: learners },
                role: 'LEARNER'
            });

            if (learnerUsers.length !== learners.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more learners not found or not of LEARNER role'
                });
            }
        }

        const batch = await Batch.create(batchData);

        // Add learners to batch
        if (learners && learners.length > 0) {
            batch.learners = learners;
            await batch.save();

            // Update learners' assignedBatches
            await User.updateMany(
                { _id: { $in: learners } },
                { $addToSet: { assignedBatches: batch._id } }
            );
        }

        const populatedBatch = await Batch.findById(batch._id)
            .populate('learners', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            data: populatedBatch
        });
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private/Admin/Manager
const updateBatch = async (req, res) => {
    try {
        const { learners, ...updateData } = req.body;
        const batchId = req.params.id;

        const batch = await Batch.findById(batchId);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check if user has permission to update this batch
        if (req.user.role === 'MANAGER' && batch.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this batch'
            });
        }

        // Store old values for audit log
        req.oldValues = batch.toObject();
        req.changes = [];

        // Update learners if provided
        if (learners !== undefined) {
            const oldLearners = batch.learners.map(l => l.toString());
            const newLearners = learners.map(l => l.toString());

            // Find added and removed learners
            const addedLearners = newLearners.filter(l => !oldLearners.includes(l));
            const removedLearners = oldLearners.filter(l => !newLearners.includes(l));

            // Validate new learners
            const validLearners = await User.find({
                _id: { $in: addedLearners },
                role: 'LEARNER'
            });

            if (validLearners.length !== addedLearners.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more learners not found or not of LEARNER role'
                });
            }

            // Update learners arrays
            await User.updateMany(
                { _id: { $in: removedLearners } },
                { $pull: { assignedBatches: batchId } }
            );

            await User.updateMany(
                { _id: { $in: addedLearners } },
                { $addToSet: { assignedBatches: batchId } }
            );

            updateData.learners = learners;

            req.changes.push({
                field: 'learners',
                oldValue: oldLearners,
                newValue: newLearners
            });
        }

        const updatedBatch = await Batch.findByIdAndUpdate(
            batchId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('learners', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedBatch
        });
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get batch statistics
// @route   GET /api/batches/:id/stats
// @access  Private
const getBatchStats = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check access permissions
        if (!hasBatchAccess(req.user, batch)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this batch'
            });
        }

        // Get attendance statistics
        const attendanceStats = await Attendance.aggregate([
            { $match: { batch: batch._id } },
            { $unwind: '$attendanceRecords' },
            {
                $group: {
                    _id: '$attendanceRecords.status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get learner attendance summary
        const learnerAttendance = await Attendance.aggregate([
            { $match: { batch: batch._id } },
            { $unwind: '$attendanceRecords' },
            {
                $group: {
                    _id: '$attendanceRecords.learner',
                    totalDays: { $sum: 1 },
                    presentDays: {
                        $sum: {
                            $cond: [
                                { $in: ['$attendanceRecords.status', ['PRESENT', 'LATE', 'HALF_DAY']] },
                                1, 0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    learner: '$_id',
                    totalDays: 1,
                    presentDays: 1,
                    attendancePercentage: {
                        $multiply: [
                            { $divide: ['$presentDays', '$totalDays'] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Populate learner details
        const learnerIds = learnerAttendance.map(la => la.learner);
        const learners = await User.find({ _id: { $in: learnerIds } })
            .select('firstName lastName email');

        const attendanceWithDetails = learnerAttendance.map(la => {
            const learner = learners.find(l => l._id.toString() === la.learner.toString());
            return {
                ...la,
                learner: learner ? {
                    id: learner._id,
                    firstName: learner.firstName,
                    lastName: learner.lastName,
                    email: learner.email
                } : null
            };
        });

        res.status(200).json({
            success: true,
            data: {
                batch: {
                    id: batch._id,
                    name: batch.name,
                    code: batch.code,
                    status: batch.status,
                    progress: batch.progress,
                    durationDays: batch.durationDays,
                    startDate: batch.startDate,
                    endDate: batch.endDate
                },
                attendanceStats,
                learnerAttendance: attendanceWithDetails,
                summary: {
                    totalLearners: batch.learners.length,
                    daysCompleted: Math.floor((Date.now() - batch.startDate) / (1000 * 60 * 60 * 24)),
                    totalDuration: batch.durationDays
                }
            }
        });
    } catch (error) {
        console.error('Get batch stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get batch attendance
// @route   GET /api/batches/:id/attendance
// @access  Private/Admin/Manager/TeamLeader
const getBatchAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check access permissions
        if (!hasBatchAccess(req.user, batch) && req.user.role !== 'TEAM_LEADER') {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this batch attendance'
            });
        }

        const query = { batch: batch._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .populate('classroom', 'name code location')
            .populate('attendanceRecords.learner', 'firstName lastName email')
            .populate('attendanceRecords.markedBy', 'firstName lastName')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Get batch attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Helper function to check batch access
const hasBatchAccess = (user, batch) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER' && batch.createdBy.toString() === user._id.toString()) return true;
    if (user.role === 'LEARNER' && batch.learners.includes(user._id)) return true;
    return true; // TEAM_LEADER, TRAINER, TA can view
};

module.exports = {
    getBatches,
    getBatch,
    createBatch,
    updateBatch,
    getBatchStats,
    getBatchAttendance
};