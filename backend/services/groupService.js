const pool = require('../config/database');

// ============================================================
// CREATE GROUP
// ============================================================

const createGroup = async (
    userId,
    name,
    type,
    defaultCurrency
) => {
    if (!name || !name.trim()) {
        throw new Error('Group name is required');
    }

    if (!type || !type.trim()) {
        throw new Error('Group type is required');
    }

    if (!defaultCurrency || !defaultCurrency.trim()) {
        throw new Error('Default currency is required');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Créer le groupe
        const groupResult = await client.query(
            `INSERT INTO groups (
                name,
                type,
                default_currency
            )
            VALUES ($1, $2, $3)
            RETURNING
                id,
                name,
                type,
                default_currency,
                is_archived,
                created_at`,
            [
                name.trim(),
                type.trim(),
                defaultCurrency.trim().toUpperCase()
            ]
        );

        const group = groupResult.rows[0];

        // Ajouter le créateur comme administrateur
        await client.query(
            `INSERT INTO group_members (
                group_id,
                user_id,
                role
            )
            VALUES ($1, $2, 'admin')`,
            [
                group.id,
                userId
            ]
        );

        await client.query('COMMIT');

        return group;

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();
    }
};


// ============================================================
// GET USER GROUPS
// ============================================================

const getUserGroups = async (userId) => {

    const result = await pool.query(
        `SELECT
            g.id,
            g.name,
            g.type,
            g.default_currency,
            g.is_archived,
            gm.role
         FROM groups g
         JOIN group_members gm
            ON g.id = gm.group_id
         WHERE gm.user_id = $1
         ORDER BY g.created_at DESC`,
        [userId]
    );

    return result.rows;
};


// ============================================================
// GET GROUP DETAILS
// ============================================================

const getGroupDetails = async (groupId) => {

    const result = await pool.query(
        `SELECT
            g.id,
            g.name,
            g.type,
            g.default_currency,
            g.is_archived,
            g.created_at,
            g.updated_at,
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            gm.role,
            gm.joined_at
         FROM groups g
         JOIN group_members gm
            ON g.id = gm.group_id
         JOIN users u
            ON gm.user_id = u.id
         WHERE g.id = $1
         ORDER BY gm.joined_at ASC`,
        [groupId]
    );

    if (result.rows.length === 0) {
        throw new Error('Group not found');
    }

    const group = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        type: result.rows[0].type,
        default_currency: result.rows[0].default_currency,
        is_archived: result.rows[0].is_archived,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at,

        members: result.rows.map((row) => ({
            user_id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            joined_at: row.joined_at
        }))
    };

    return group;
};


// ============================================================
// UPDATE GROUP
// ============================================================

const updateGroup = async (
    groupId,
    name,
    type,
    defaultCurrency
) => {

    const result = await pool.query(
        `UPDATE groups
         SET
            name = COALESCE(NULLIF($1, ''), name),
            type = COALESCE(NULLIF($2, ''), type),
            default_currency =
                COALESCE(NULLIF($3, ''), default_currency),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING
            id,
            name,
            type,
            default_currency,
            is_archived,
            updated_at`,
        [
            name ? name.trim() : null,
            type ? type.trim() : null,
            defaultCurrency
                ? defaultCurrency.trim().toUpperCase()
                : null,
            groupId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error('Group not found');
    }

    return result.rows[0];
};


// ============================================================
// ARCHIVE GROUP
// ============================================================

const archiveGroup = async (groupId) => {

    const result = await pool.query(
        `UPDATE groups
         SET
            is_archived = TRUE,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING
            id,
            name,
            type,
            default_currency,
            is_archived,
            updated_at`,
        [groupId]
    );

    if (result.rows.length === 0) {
        throw new Error('Group not found');
    }

    return result.rows[0];
};


// ============================================================
// UPDATE MEMBER ROLE
// ============================================================

const updateMemberRole = async (
    groupId,
    userId,
    role
) => {

    // ========================================================
    // VERIFIER LE ROLE
    // ========================================================

    if (!role) {
        throw new Error('Role is required');
    }

    if (role !== 'admin' && role !== 'member') {
        throw new Error(
            'Role must be admin or member'
        );
    }

    // ========================================================
    // VERIFIER QUE LE MEMBRE EXISTE
    // ========================================================

    const member = await pool.query(
        `SELECT
            group_id,
            user_id,
            role
         FROM group_members
         WHERE group_id = $1
         AND user_id = $2`,
        [
            groupId,
            userId
        ]
    );

    if (member.rows.length === 0) {
        throw new Error(
            'Member not found in this group'
        );
    }

    // ========================================================
    // MODIFIER LE ROLE
    // ========================================================

    const result = await pool.query(
        `UPDATE group_members
         SET role = $1
         WHERE group_id = $2
         AND user_id = $3
         RETURNING
            id,
            group_id,
            user_id,
            role,
            joined_at`,
        [
            role,
            groupId,
            userId
        ]
    );

    return result.rows[0];
};


// ============================================================
// REMOVE MEMBER
// ============================================================

const removeMember = async (
    groupId,
    userId
) => {

    // ========================================================
    // TODO SEMAINE 3
    // Vérifier que le solde du membre est nul
    // avant de permettre sa suppression.
    // ========================================================

    // ========================================================
    // VERIFIER QUE LE MEMBRE EXISTE
    // ========================================================

    const member = await pool.query(
        `SELECT
            group_id,
            user_id,
            role
         FROM group_members
         WHERE group_id = $1
         AND user_id = $2`,
        [
            groupId,
            userId
        ]
    );

    if (member.rows.length === 0) {
        throw new Error(
            'Member not found in this group'
        );
    }

    // ========================================================
    // SUPPRIMER LE MEMBRE
    // ========================================================

    const result = await pool.query(
        `DELETE FROM group_members
         WHERE group_id = $1
         AND user_id = $2
         RETURNING
            id,
            group_id,
            user_id,
            role`,
        [
            groupId,
            userId
        ]
    );

    return result.rows[0];
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createGroup,
    getUserGroups,
    getGroupDetails,
    updateGroup,
    archiveGroup,
    updateMemberRole,
    removeMember
};