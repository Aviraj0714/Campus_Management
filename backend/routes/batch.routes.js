const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  getBatchStats,
  getBatchAttendance
} = require('../controllers/batch.controller');

// All routes protected
router.use(protect);

// Apply audit logging to non-GET routes
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    auditLog(req, res, next);
  } else {
    next();
  }
});

// Routes accessible by ADMIN and MANAGER for creation
router.route('/')
  .get(getBatches)
  .post(authorize('ADMIN', 'MANAGER'), createBatch);

// Routes accessible by ADMIN, MANAGER, and TEAM_LEADER for viewing
router.route('/:id')
  .get(authorize('ADMIN', 'MANAGER', 'TEAM_LEADER', 'TRAINER', 'TA', 'LEARNER'), getBatch)
  .put(authorize('ADMIN', 'MANAGER'), updateBatch);

router.route('/:id/stats')
  .get(authorize('ADMIN', 'MANAGER', 'TEAM_LEADER', 'TRAINER', 'TA', 'LEARNER'), getBatchStats);

router.route('/:id/attendance')
  .get(authorize('ADMIN', 'MANAGER', 'TEAM_LEADER'), getBatchAttendance);

module.exports = router;