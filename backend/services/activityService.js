const pool = require('../config/database');


// ============================================================
// CREATE ACTIVITY
// ============================================================

const createActivity = async (
    groupId,
    userId,
    actionType,
    entityType,
    entityId,
    metadata,
    dbClient = pool
) => {

    // ========================================================
    // VALIDATIONS
    // ========================================================

    const validGroupId = Number(groupId);
    const validUserId = Number(userId);

    if (
        !Number.isInteger(validGroupId) ||
        validGroupId <= 0
    ) {
        throw new Error('Invalid group ID');
    }

    if (
        !Number.isInteger(validUserId) ||
        validUserId <= 0
    ) {
        throw new Error('Invalid user ID');
    }

    if (!actionType) {
        throw new Error('Action type is required');
    }

    if (!entityType) {
        throw new Error('Entity type is required');
    }


    // ========================================================
    // INSERT ACTIVITY
    // ========================================================

    const result = await dbClient.query(
        `INSERT INTO activities
        (
            group_id,
            user_id,
            action_type,
            entity_type,
            entity_id,
            metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            validGroupId,
            validUserId,
            actionType,
            entityType,
            entityId || null,
            metadata || null
        ]
    );

    return result.rows[0];
};


// ============================================================
// GET GROUP ACTIVITIES
// ============================================================

const getGroupActivities = async (groupId) => {

    const validGroupId = Number(groupId);

    if (
        !Number.isInteger(validGroupId) ||
        validGroupId <= 0
    ) {
        throw new Error('Invalid group ID');
    }


    // ========================================================
    // RECUPERER LES ACTIVITES
    // ========================================================

    const result = await pool.query(
        `SELECT
            a.id,
            a.group_id,
            a.user_id,
            u.first_name,
            u.last_name,
            a.action_type,
            a.entity_type,
            a.entity_id,
            a.metadata,
            a.created_at
         FROM activities a
         JOIN users u
            ON a.user_id = u.id
         WHERE a.group_id = $1
         ORDER BY a.created_at DESC,
                  a.id DESC`,
        [validGroupId]
    );

    return result.rows;
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    createActivity,
    getGroupActivities
};