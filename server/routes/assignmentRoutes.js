const express = require('express');
const { body, param, query } = require('express-validator');

const assignmentController = require('../controllers-sql/assignmentController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// List assignments (optional ?courseId=)
router.get('/assignments', [query('courseId').optional().isInt()], validateRequest, assignmentController.listAssignments);

// Create assignment (admin/staff expected)
router.post('/assignments', [
	body('courseId').isInt(),
	body('title').isString().trim().notEmpty(),
	body('description').optional().isString(),
	body('dueDate').isISO8601(),
	body('totalPoints').isInt({ min: 1 }),
], validateRequest, assignmentController.createAssignment);

// Get single assignment
router.get('/assignments/:assignmentId', [param('assignmentId').isInt()], validateRequest, assignmentController.getAssignmentById);

// Update assignment (admin/staff expected)
router.patch('/assignments/:assignmentId', [
	param('assignmentId').isInt(),
	body('title').optional().isString().trim(),
	body('description').optional().isString(),
	body('dueDate').optional().isISO8601(),
	body('totalPoints').optional().isInt({ min: 1 }),
], validateRequest, assignmentController.updateAssignment);

// Delete assignment (admin/staff expected)
router.delete('/assignments/:assignmentId', [param('assignmentId').isInt()], validateRequest, assignmentController.deleteAssignment);

// Student submits assignment
router.post('/assignments/:assignmentId/submit', [param('assignmentId').isInt(), body('studentId').isInt()], validateRequest, assignmentController.submitAssignment);

// Grade assignment (admin/staff expected)
router.post('/assignments/:assignmentId/grade', [
	param('assignmentId').isInt(),
	body('studentId').isInt(),
	body('points').isFloat({ min: 0 }),
	body('feedback').optional().isString(),
], validateRequest, assignmentController.gradeAssignment);

module.exports = router;

