const expenseService = require('../services/expenseService');


// ============================================================
// CREATE EXPENSE
// ============================================================

const createExpenseController = async (req, res) => {
    try {

        const createdBy = req.user.id;
        const groupId = req.params.groupId;

        const {
            payerId,
            categoryId,
            title,
            amount,
            currency,
            exchangeRate,
            splitMode,
            expenseDate,
            participants
        } = req.body;


        const expense = await expenseService.createExpense(
            groupId,
            payerId,
            categoryId,
            createdBy,
            title,
            amount,
            currency,
            exchangeRate,
            splitMode,
            expenseDate,
            participants
        );


        res.status(201).json(expense);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


// ============================================================
// GET GROUP EXPENSES
// ============================================================

const getGroupExpensesController = async (req, res) => {
    try {

        const groupId = req.params.groupId;

       const {
    categoryId,
    memberId,
    search,
    startDate,
    endDate,
    page,
    limit
} = req.query;


        const result =
    await expenseService.getGroupExpenses(
        groupId,
        categoryId,
        memberId,
        search,
        startDate,
        endDate,
        page,
        limit
    );

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


// ============================================================
// GET EXPENSE DETAILS
// ============================================================

const getExpenseDetailsController = async (req, res) => {
    try {

        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;


        const result = await expenseService.getExpenseDetails(
            groupId,
            expenseId
        );


        res.status(200).json(result);

    } catch (error) {

        if (error.message === 'Expense not found') {

            return res.status(404).json({
                message: error.message
            });

        }


        res.status(400).json({
            message: error.message
        });

    }
};

// ============================================================
// GET EXPENSE HISTORY
// ============================================================

const getExpenseHistoryController = async (req, res) => {

    try {

        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;


        const history =
            await expenseService.getExpenseHistory(
                groupId,
                expenseId
            );


        res.status(200).json(history);

    } catch (error) {

        if (error.message === 'Expense not found') {

            return res.status(404).json({
                message: error.message
            });

        }


        res.status(400).json({
            message: error.message
        });

    }
};

// ============================================================
// UPDATE EXPENSE
// ============================================================

const updateExpenseController = async (req, res) => {
    try {

        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;

        const userId = req.user.id;
        const userRole = req.groupRole;

        const updates = req.body;


        const result = await expenseService.updateExpense(
            groupId,
            expenseId,
            userId,
            userRole,
            updates
        );


        res.status(200).json(result);

    } catch (error) {

        // Expense not found
        if (error.message === 'Expense not found') {

            return res.status(404).json({
                message: error.message
            });

        }


        // Permission error
        if (
            error.message.includes(
                'not allowed to update'
            )
        ) {

            return res.status(403).json({
                message: error.message
            });

        }


        res.status(400).json({
            message: error.message
        });

    }
};


// ============================================================
// DELETE EXPENSE
// ============================================================

const deleteExpenseController = async (req, res) => {
    try {

        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;

        const userId = req.user.id;
        const userRole = req.groupRole;


        const result = await expenseService.deleteExpense(
            groupId,
            expenseId,
            userId,
            userRole
        );


        res.status(200).json(result);

    } catch (error) {

        // Expense not found
        if (error.message === 'Expense not found') {

            return res.status(404).json({
                message: error.message
            });

        }


        // Permission error
        if (
            error.message.includes(
                'not allowed to delete'
            )
        ) {

            return res.status(403).json({
                message: error.message
            });

        }


        res.status(400).json({
            message: error.message
        });

    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    createExpenseController,
    getGroupExpensesController,
    getExpenseDetailsController,
    getExpenseHistoryController,
    updateExpenseController,
    deleteExpenseController
};