// ============================================================
// CHRIKI - GROUP CONTROLLER
// ============================================================

const groupService = require('../services/groupService');

// ============================================================
// CREATE GROUP
// ============================================================

const createGroupController = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            name,
            type,
            default_currency
        } = req.body;

        const group =
            await groupService.createGroup(
                userId,
                name,
                type,
                default_currency
            );

        return res.status(201).json(group);

    } catch (error) {

        console.error(
            'Erreur create group :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// GET USER GROUPS
// ============================================================

const getUserGroupsController = async (req, res) => {

    try {

        const userId = req.user.id;

        const groups =
            await groupService.getUserGroups(
                userId
            );

        return res.status(200).json(groups);

    } catch (error) {

        console.error(
            'Erreur get user groups :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// GET GROUP DETAILS
// ============================================================

const getGroupDetailsController = async (req, res) => {

    try {

        const groupId =
            Number(req.params.groupId);

        // ========================================================
        // VERIFIER GROUP ID
        // ========================================================

        if (
            !Number.isInteger(groupId) ||
            groupId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        // ========================================================
        // RECUPERER LE GROUPE
        // ========================================================

        const groupDetails =
            await groupService.getGroupDetails(
                groupId
            );

        return res.status(200).json(
            groupDetails
        );

    } catch (error) {

        console.error(
            'Erreur get group details :',
            error
        );

        if (
            error.message === 'Group not found'
        ) {

            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// UPDATE GROUP
// ============================================================

const updateGroupController = async (req, res) => {

    try {

        // ========================================================
        // VERIFIER LE ROLE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can update group details'
            });
        }

        const groupId =
            Number(req.params.groupId);

        // ========================================================
        // VERIFIER GROUP ID
        // ========================================================

        if (
            !Number.isInteger(groupId) ||
            groupId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        const {
            name,
            type,
            default_currency
        } = req.body;

        // ========================================================
        // MODIFIER LE GROUPE
        // ========================================================

        const updatedGroup =
            await groupService.updateGroup(
                groupId,
                name,
                type,
                default_currency
            );

        return res.status(200).json(
            updatedGroup
        );

    } catch (error) {

        console.error(
            'Erreur update group :',
            error
        );

        if (
            error.message === 'Group not found'
        ) {

            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// ARCHIVE GROUP
// ============================================================

const archiveGroupController = async (req, res) => {

    try {

        // ========================================================
        // VERIFIER LE ROLE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can archive the group'
            });
        }

        const groupId =
            Number(req.params.groupId);

        // ========================================================
        // VERIFIER GROUP ID
        // ========================================================

        if (
            !Number.isInteger(groupId) ||
            groupId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        // ========================================================
        // ARCHIVER LE GROUPE
        // ========================================================

        const archivedGroup =
            await groupService.archiveGroup(
                groupId
            );

        return res.status(200).json(
            archivedGroup
        );

    } catch (error) {

        console.error(
            'Erreur archive group :',
            error
        );

        if (
            error.message === 'Group not found'
        ) {

            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// UPDATE MEMBER ROLE
// ============================================================

const updateMemberRoleController = async (
    req,
    res
) => {

    try {

        // ========================================================
        // SEUL UN ADMIN PEUT MODIFIER UN MEMBRE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can update member roles'
            });
        }

        // ========================================================
        // RECUPERER LES IDS
        // ========================================================

        const groupId =
            Number(req.params.groupId);

        const userId =
            Number(req.params.userId);

        // ========================================================
        // VERIFIER LES IDS
        // ========================================================

        if (
            !Number.isInteger(groupId) ||
            groupId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        // ========================================================
        // RECUPERER LE ROLE
        // ========================================================

        const { role } = req.body;

        // ========================================================
        // MODIFIER LE ROLE
        // ========================================================

        const updatedMember =
            await groupService.updateMemberRole(
                groupId,
                userId,
                role
            );

        return res.status(200).json(
            updatedMember
        );

    } catch (error) {

        console.error(
            'Erreur update member role :',
            error
        );

        if (
            error.message ===
            'Member not found in this group'
        ) {

            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// REMOVE MEMBER
// ============================================================

const removeMemberController = async (
    req,
    res
) => {

    try {

        // ========================================================
        // SEUL UN ADMIN PEUT SUPPRIMER UN MEMBRE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can remove members'
            });
        }

        // ========================================================
        // RECUPERER LES IDS
        // ========================================================

        const groupId =
            Number(req.params.groupId);

        const userId =
            Number(req.params.userId);

        // ========================================================
        // VERIFIER LES IDS
        // ========================================================

        if (
            !Number.isInteger(groupId) ||
            groupId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        // ========================================================
        // SUPPRIMER LE MEMBRE
        // ========================================================

        const removedMember =
            await groupService.removeMember(
                groupId,
                userId
            );

        return res.status(200).json({
            message:
                'Member removed successfully',
            member: removedMember
        });

    } catch (error) {

        console.error(
            'Erreur remove member :',
            error
        );

        if (
            error.message ===
            'Member not found in this group'
        ) {

            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createGroupController,
    getUserGroupsController,
    getGroupDetailsController,
    updateGroupController,
    archiveGroupController,
    updateMemberRoleController,
    removeMemberController
};