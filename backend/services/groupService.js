const pool = require('../config/database');
const createGroup = async (userId, name, type, defaultCurrency) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const row = await client.query(
            "INSERT INTO groups (name, type, default_currency) VALUES ($1, $2, $3) RETURNING id, name, type, default_currency",
            [name, type, defaultCurrency]
        );
        await client.query(
            "INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')",
            [row.rows[0].id, userId]
        );
        await client.query('COMMIT');
        return row.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const getUserGroups = async(userId)=> {
    const result = await pool.query (
        "SELECT g.id, g.name, g.type, g.default_currency, gm.role FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id=$1",
        [userId]
    );
    return result.rows;
    
}

const getGroupDetails = async(groupId)=> {
    const result = await pool.query (
       "SELECT g.name, g.type, g.default_currency, g.is_archived, u.id AS user_id, u.first_name, u.last_name, gm.role FROM groups g JOIN group_members gm ON g.id = gm.group_id JOIN users u ON gm.user_id = u.id WHERE g.id = $1",
        [groupId]
    );
    if (result.rows.length === 0) {
    throw new Error("Group not found");
}

const group = {
    name: result.rows[0].name,
    type: result.rows[0].type,
    default_currency: result.rows[0].default_currency,
    is_archived: result.rows[0].is_archived,
    members: result.rows.map(row => ({
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role
    }))
};

return group;
   
}

const updateGroup = async(groupId, name, type, defaultCurrency)=> {
    const result = await pool.query(
        "UPDATE groups SET name = COALESCE($1, name), type = COALESCE($2, type), default_currency = COALESCE($3, default_currency) WHERE id = $4 RETURNING id, name, type, default_currency",
        [name, type, defaultCurrency, groupId]
    );
    if (result.rows.length === 0) {
        throw new Error("Group not found");
    }
    return result.rows[0];
}

const archiveGroup = async (groupId)=> {
    const result = await pool.query(
        "UPDATE groups SET  is_archived = TRUE WHERE id = $1 RETURNING id, name, type, default_currency, is_archived",
    
        [groupId]
    )

    if (result.rows.length === 0) {
        throw new Error("Group not found");
    }
    return result.rows[0];
}
module.exports = { createGroup, getUserGroups, getGroupDetails, updateGroup, archiveGroup };