const pool = require('../config/database');


// ============================================================
// GET CATEGORIES
// ============================================================

const getCategories = async (groupId) => {

    // ========================================================
    // CATEGORIES GLOBALES
    // ========================================================

    if (!groupId) {

        const result = await pool.query(
            `
            SELECT *
            FROM categories
            WHERE group_id IS NULL
            ORDER BY name ASC
            `
        );

        return result.rows;
    }


    // ========================================================
    // CATEGORIES GLOBALES + CATEGORIES DU GROUPE
    // ========================================================

    const result = await pool.query(
        `
        SELECT *
        FROM categories
        WHERE group_id IS NULL
           OR group_id = $1
        ORDER BY name ASC
        `,
        [groupId]
    );

    return result.rows;
};


// ============================================================
// CREATE CATEGORY
// ============================================================

const createCategory = async (
    groupId,
    userRole,
    name,
    nameAr,
    icon
) => {

    // ========================================================
    // VERIFICATION ADMIN
    // ========================================================

    if (userRole !== 'admin') {

        throw new Error(
            'Only admins can create custom categories'
        );
    }


    // ========================================================
    // VERIFICATION DU NOM
    // ========================================================

    if (!name || !name.trim()) {

        throw new Error(
            'Category name is required'
        );
    }


    // ========================================================
    // CREATION
    // ========================================================

    const result = await pool.query(
        `
        INSERT INTO categories (
            group_id,
            name,
            name_ar,
            icon
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            groupId,
            name.trim(),
            nameAr || null,
            icon || null
        ]
    );

    return result.rows[0];
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getCategories,
    createCategory
};