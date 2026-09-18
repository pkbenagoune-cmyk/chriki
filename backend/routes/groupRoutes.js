// ============================================================
// CHRIKI - GROUP ROUTES
// ============================================================

const express = require('express');

const router = express.Router();

// ============================================================
// MIDDLEWARES
// ============================================================

const auth = require('../middlewares/auth');

const groupMembership =
    require('../middlewares/groupMembership');

// ============================================================
// CONTROLLER
// ============================================================

const groupController =
    require('../controllers/groupController');

// ============================================================
// CREATE GROUP
// ============================================================

router.post(
    '/',
    auth,
    groupController.createGroupController
);

// ============================================================
// GET USER GROUPS
// ============================================================

router.get(
    '/',
    auth,
    groupController.getUserGroupsController
);

// ============================================================
// GET GROUP DETAILS
// ============================================================

router.get(
    '/:groupId',
    auth,
    groupMembership,
    groupController.getGroupDetailsController
);

// ============================================================
// UPDATE GROUP
// ============================================================

router.patch(
    '/:groupId',
    auth,
    groupMembership,
    groupController.updateGroupController
);

// ============================================================
// ARCHIVE GROUP
// ============================================================

router.patch(
    '/:groupId/archive',
    auth,
    groupMembership,
    groupController.archiveGroupController
);

// ============================================================
// UPDATE MEMBER ROLE
// ============================================================

router.patch(
    '/:groupId/members/:userId',
    auth,
    groupMembership,
    groupController.updateMemberRoleController
);

// ============================================================
// REMOVE MEMBER
// ============================================================

router.delete(
    '/:groupId/members/:userId',
    auth,
    groupMembership,
    groupController.removeMemberController
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;