// ============================================================
// CHRIKI - INVITATION SERVICE
// ============================================================

const pool = require("../config/database");
const crypto = require("crypto");

// ============================================================
// GENERER UNE INVITATION
// ============================================================

const generateInvitation = async (groupId, created_by) => {

    if (!groupId) {
        throw new Error("Group ID is required");
    }

    if (!created_by) {
        throw new Error("User ID is required");
    }

    const code =
        crypto.randomBytes(3).toString("hex").toUpperCase();

    const expires_at = new Date();

    expires_at.setDate(
        expires_at.getDate() + 7
    );

    const result = await pool.query(
        `INSERT INTO invitations
        (group_id, created_by, code, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            groupId,
            created_by,
            code,
            expires_at
        ]
    );

    return result.rows[0];
};

// ============================================================
// REJOINDRE UN GROUPE AVEC UNE INVITATION
// ============================================================

const joinGroupWithInvitation = async (
    userId,
    code
) => {

    if (!code) {
        throw new Error(
            "Invitation code is required"
        );
    }

    if (!userId) {
        throw new Error(
            "User ID is required"
        );
    }

    const invitation = await pool.query(
        `SELECT *
         FROM invitations
         WHERE code = $1
         AND expires_at > NOW()
         AND is_revoked = FALSE`,
        [code]
    );

    if (!invitation.rows[0]) {
        throw new Error(
            "Invalid or expired invitation code"
        );
    }

    const groupId =
        invitation.rows[0].group_id;

    const is_member = await pool.query(
        `SELECT *
         FROM group_members
         WHERE group_id = $1
         AND user_id = $2`,
        [
            groupId,
            userId
        ]
    );

    if (is_member.rows[0]) {
        throw new Error(
            "User is already a member of the group"
        );
    }

    await pool.query(
        `INSERT INTO group_members
        (group_id, user_id, role)
        VALUES ($1, $2, 'member')`,
        [
            groupId,
            userId
        ]
    );

    return {
        message:
            "User has successfully joined the group",
        group_id: groupId
    };
};

// ============================================================
// LISTER LES INVITATIONS ACTIVES
// ============================================================

const getActiveInvitations = async (
    groupId
) => {

    if (!groupId) {
        throw new Error(
            "Group ID is required"
        );
    }

    const result = await pool.query(
        `SELECT
            i.id,
            i.group_id,
            i.code,
            i.created_by,
            u.first_name AS created_by_first_name,
            u.last_name AS created_by_last_name,
            i.expires_at,
            i.is_revoked,
            i.created_at
         FROM invitations i
         JOIN users u
             ON i.created_by = u.id
         WHERE i.group_id = $1
         AND i.is_revoked = FALSE
         AND i.expires_at > NOW()
         ORDER BY i.created_at DESC`,
        [groupId]
    );

    return result.rows;
};

// ============================================================
// REVOQUER UNE INVITATION
// ============================================================

const revokeInvitation = async (
    groupId,
    code
) => {

    if (!code) {
        throw new Error(
            "Invitation code is required"
        );
    }

    const invitation = await pool.query(
        `SELECT *
         FROM invitations
         WHERE code = $1
         AND group_id = $2`,
        [
            code,
            groupId
        ]
    );

    if (!invitation.rows[0]) {
        throw new Error(
            "Invitation not found for this group"
        );
    }

    if (invitation.rows[0].is_revoked) {
        throw new Error(
            "Invitation is already revoked"
        );
    }

    const result = await pool.query(
        `UPDATE invitations
         SET is_revoked = TRUE
         WHERE code = $1
         RETURNING *`,
        [code]
    );

    return result.rows[0];
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    generateInvitation,
    joinGroupWithInvitation,
    getActiveInvitations,
    revokeInvitation
};