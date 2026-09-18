const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const groupMembership = require('../middlewares/groupMembership');
const activityController = require('../controllers/activityController');
router.get("/:groupId/activities", auth, groupMembership, activityController.getGroupActivitiesController);
module.exports = router;