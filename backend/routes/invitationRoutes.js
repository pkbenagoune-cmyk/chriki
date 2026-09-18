// ============================================================
// CHRIKI - INVITATION ROUTES
// ============================================================

const express = require('express');

const router = express.Router();

// ============================================================
// MIDDLEWARES
// ============================================================

const auth = require('../middlewares/auth.js');

const groupMembership = require('../middlewares/groupMembership');

// ============================================================
// CONTROLLER
// ============================================================

const invitationController =
    require('../controllers/invitationController');

// ============================================================
// GENERER UNE INVITATION
// ============================================================

router.post(
    '/groups/:groupId/invitations',
    auth,
    groupMembership,
    invitationController.generateInvitationController
);

// ============================================================
// LISTER LES INVITATIONS ACTIVES
// ============================================================

router.get(
    '/groups/:groupId/invitations',
    auth,
    groupMembership,
    invitationController.getActiveInvitationsController
);

// ============================================================
// REJOINDRE UN GROUPE AVEC UNE INVITATION
// ============================================================

router.post(
    '/invitations/join',
    auth,
    invitationController.joinGroupWithInvitationController
);

// ============================================================
// REVOQUER UNE INVITATION
// ============================================================

router.patch(
    '/groups/:groupId/invitations/:code/revoke',
    auth,
    groupMembership,
    invitationController.revokeInvitationController
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;