const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const expensecontroller = require('../controllers/expenseController');
const groupMembership = require('../middlewares/groupMembership');

router.post('/:groupId/expenses', auth, groupMembership, expensecontroller.createExpenseController );
router.get('/:groupId/expenses/:expenseId/history',auth,groupMembership,expensecontroller.getExpenseHistoryController);
router.get('/:groupId/expenses',auth, groupMembership, expensecontroller.getGroupExpensesController);
router.get('/:groupId/expenses/:expenseId',auth, groupMembership, expensecontroller.getExpenseDetailsController);
router.patch('/:groupId/expenses/:expenseId',auth, groupMembership, expensecontroller.updateExpenseController);
router.delete('/:groupId/expenses/:expenseId',auth, groupMembership, expensecontroller.deleteExpenseController);
module.exports = router;