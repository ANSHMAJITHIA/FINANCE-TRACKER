const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  depositToGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.post('/:id/deposit', depositToGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);

module.exports = router;
