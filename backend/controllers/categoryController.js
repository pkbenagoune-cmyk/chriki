const categoryService = require('../services/categoryService');

const getCategoriesController = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const result = await categoryService.getCategories(groupId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createCategoryController = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userRole = req.groupRole;
        const { name, nameAr, icon } = req.body;

        const result = await categoryService.createCategory(groupId, userRole, name, nameAr, icon);
        res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('Only admins')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getCategoriesController, createCategoryController };