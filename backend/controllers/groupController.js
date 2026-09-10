const groupService = require('../services/groupService');
const createGroupController = async(req, res) => {
    try {
        const userId = req.user.id;
        const group = await groupService.createGroup(userId, req.body.name, req.body.type, req.body.default_currency);
        res.status(201).json(group);
    }  catch (error) {
    res.status(400).json({ message: error.message });
}
}

const getUserGroupsController = async(req, res) => {
    try{
        const userId = req.user.id;
        const mygroups = await groupService.getUserGroups(userId);
        res.status(200).json(mygroups);

    }
    catch (error){
        res.status(400).json({message:error.message});
    }
}

const getGroupDetailsController = async (req, res) => {
    try {
        const groupId = Number(req.params.groupId);
        const groupDetails = await groupService.getGroupDetails(groupId);
        res.status(200).json(groupDetails);
   
        } catch (error) {
    if (error.message === 'Group not found') {
        return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
}
}

const updateGroupController = async (req, res) => {
    try {
        const role = req.groupRole;

        if (role !== 'admin') {
            return res.status(403).json({
                message: 'Only admins can update group details'
            });
        }

        const groupId = Number(req.params.groupId);

        const updatedGroup = await groupService.updateGroup(
            groupId,
            req.body.name,
            req.body.type,
            req.body.default_currency
        );

        res.status(200).json(updatedGroup);

    } catch (error) {
        if (error.message === 'Group not found') {
            return res.status(404).json({ message: error.message });
        }

        res.status(400).json({ message: error.message });
    }
}

const archiveGroupController = async (req, res) => {
    try {
       
        const groupId= Number(req.params.groupId);
        const role= req.groupRole;
        
        if(role !== 'admin'){
            return res.status(403).json({message:'Only admins can archive the group'});
        }
        const archivedGroup = await groupService.archiveGroup(groupId);
        res.status(200).json(archivedGroup);
    } catch (error) {
    if (error.message === 'Group not found') {
        return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
}
}

module.exports = { createGroupController, getUserGroupsController, getGroupDetailsController, updateGroupController, archiveGroupController };