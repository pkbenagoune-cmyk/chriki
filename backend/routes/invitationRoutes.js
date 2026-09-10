const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.js');
const groupMembership = require('../middlewares/groupMembership');
const invitationController = require('../controllers/invitationController');

router.post(
    '/groups/:groupId/invitations',
    auth,
    groupMembership,
    invitationController.generateInvitationController
);

router.post(
    '/invitations/join',
    auth,
    invitationController.joinGroupWithInvitationController
);

router.patch(
    '/groups/:groupId/invitations/:code/revoke',
    auth,
    groupMembership,
    invitationController.revokeInvitationController
);

module.exports = router;