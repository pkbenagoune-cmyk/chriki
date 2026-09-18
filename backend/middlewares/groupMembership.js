
const pool = require('../config/database');

// ============================================================
// GROUP MEMBERSHIP MIDDLEWARE
// ============================================================

const groupMembership = async (req, res, next) => {

    try {

        // ========================================================
        // RECUPERER LES IDS
        // ========================================================

        const groupId = Number(req.params.groupId);

        const userId = req.user.id;

        // ========================================================
        // VERIFIER GROUP ID
        // ========================================================

        if (!Number.isInteger(groupId) || groupId <= 0) {

            return res.status(400).json({
                message: 'Invalid group ID.'
            });
        }

        // ========================================================
        // VERIFIER L'APPARTENANCE AU GROUPE
        // ========================================================

        const result = await pool.query(
            `
            SELECT group_id, role
            FROM group_members
            WHERE group_id = $1
              AND user_id = $2
            `,
            [
                groupId,
                userId
            ]
        );

        // ========================================================
        // UTILISATEUR NON MEMBRE
        // ========================================================

        if (result.rows.length === 0) {

            return res.status(403).json({
                message: 'You are not a member of this group.'
            });
        }

        // ========================================================
        // STOCKER LE ROLE
        // ========================================================

        req.groupRole = result.rows[0].role;

        // ========================================================
        // CONTINUER
        // ========================================================

        next();

    } catch (error) {

        console.error(
            'Erreur groupMembership :',
            error
        );

        return res.status(500).json({
            message:
                'Erreur lors de la vérification de l\'appartenance au groupe.'
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = groupMembership;
