const activityService = require('../services/activityService');

const getGroupActivitiesController = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const activities = await activityService.getGroupActivities(groupId);

        res.status(200).json(activities);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    getGroupActivitiesController
};