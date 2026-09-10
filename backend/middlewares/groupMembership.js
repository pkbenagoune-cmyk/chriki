const pool = require('../config/database');
const groupMembership = async (req, res, next)=> {
    const groupId = Number(req.params.groupId);
    const userId= req.user.id;
    const exists= await pool.query(
        "SELECT group_id, role FROM group_members WHERE group_id=$1 AND user_id=$2",
        [groupId, userId]
    )
    if (!exists.rows[0]) {
        return res.status(403).json({ error: "You are not a member of this group." });
    }
    req.groupRole = exists.rows[0].role;
    next();
}

module.exports = groupMembership;