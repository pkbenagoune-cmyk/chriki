const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');

const groupMembership =
    require('../middlewares/groupMembership');

const categoryController =
    require('../controllers/categoryController');


// ============================================================
// GET CATEGORIES
// ============================================================

router.get(
    '/:groupId/categories',
    auth,
    groupMembership,
    categoryController.getCategoriesController
);


// ============================================================
// CREATE CATEGORY
// ============================================================

router.post(
    '/:groupId/categories',
    auth,
    groupMembership,
    categoryController.createCategoryController
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;