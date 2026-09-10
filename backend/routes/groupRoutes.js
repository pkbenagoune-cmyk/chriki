const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');

const groupController = require('../controllers/groupController');
const groupMembership = require('../middlewares/groupMembership');

router.post('/', auth, groupController.createGroupController);

router.get('/', auth, groupController.getUserGroupsController);

router.get('/:groupId', auth, groupMembership, groupController.getGroupDetailsController);

router.patch('/:groupId', auth, groupMembership, groupController.updateGroupController);

router.patch('/:groupId/archive', auth, groupMembership, groupController.archiveGroupController);

module.exports = router;