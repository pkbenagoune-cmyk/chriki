// ============================================================
// CHRIKI - INVITATION CONTROLLER
// ============================================================

const invitationService =
    require('../services/invitationService');

// ============================================================
// GENERER UNE INVITATION
// ============================================================

const generateInvitationController = async (req, res) => {

    try {

        // ========================================================
        // VERIFIER LE ROLE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can generate invitations'
            });
        }

        // ========================================================
        // RECUPERER LES IDS
        // ========================================================

        const userId = req.user.id;
        const groupId = req.params.groupId;

        // ========================================================
        // GENERER L'INVITATION
        // ========================================================

        const invitation =
            await invitationService.generateInvitation(
                groupId,
                userId
            );

        return res.status(201).json(invitation);

    } catch (error) {

        console.error(
            'Erreur generate invitation :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};

// ============================================================
// LISTER LES INVITATIONS ACTIVES
// ============================================================

const getActiveInvitationsController = async (req, res) => {

    try {

        // ========================================================
        // SEUL UN MEMBRE DU GROUPE PEUT VOIR LES INVITATIONS
        // ========================================================

        const groupId = req.params.groupId;

        // ========================================================
        // RECUPERER LES INVITATIONS
        // ========================================================

        const invitations =
            await invitationService.getActiveInvitations(
                groupId
            );

        // ========================================================
        // REPONSE
        // ========================================================

        return res.status(200).json(invitations);

    } catch (error) {

        console.error(
            'Erreur get active invitations :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};

// ============================================================
// REJOINDRE UN GROUPE AVEC UNE INVITATION
// ============================================================

const joinGroupWithInvitationController = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;
        const code = req.body.code;

        // ========================================================
        // REJOINDRE LE GROUPE
        // ========================================================

        const result =
            await invitationService.joinGroupWithInvitation(
                userId,
                code
            );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            'Erreur join group invitation :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};

// ============================================================
// REVOQUER UNE INVITATION
// ============================================================

const revokeInvitationController = async (
    req,
    res
) => {

    try {

        // ========================================================
        // VERIFIER LE ROLE
        // ========================================================

        if (req.groupRole !== 'admin') {

            return res.status(403).json({
                message:
                    'Only admins can revoke invitations'
            });
        }

        // ========================================================
        // RECUPERER LES PARAMETRES
        // ========================================================

        const groupId = req.params.groupId;
        const code = req.params.code;

        // ========================================================
        // REVOQUER L'INVITATION
        // ========================================================

        const invitation =
            await invitationService.revokeInvitation(
                groupId,
                code
            );

        return res.status(200).json(invitation);

    } catch (error) {

        console.error(
            'Erreur revoke invitation :',
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    generateInvitationController,
    getActiveInvitationsController,
    joinGroupWithInvitationController,
    revokeInvitationController
};