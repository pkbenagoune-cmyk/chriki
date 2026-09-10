const invitationService = require('../services/invitationService');
const generateInvitationController = async (req, res) => {
    try {
        if (req.groupRole !== 'admin') {
            return res.status(403).json({ message: 'Only admins can generate invitations' });
        }
        const userId = req.user.id;
        const groupId = req.params.groupId;
        const invitation = await invitationService.generateInvitation(groupId, userId);
        res.status(201).json(invitation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const joinGroupWithInvitationController = async (req, res) => {
    try {
        const userId = req.user.id;
        const code = req.body.code;
        const invitation = await invitationService.joinGroupWithInvitation(userId, code);
        res.status(200).json(invitation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
const revokeInvitationController = async (req, res) => {
    try {
        if (req.groupRole !== 'admin') {
            return res.status(403).json({ message: 'Only admins can revoke invitations' });
        }
        const groupId = req.params.groupId;
        const code = req.params.code;
        const invitation = await invitationService.revokeInvitation(groupId, code);
        res.status(200).json(invitation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
module.exports={generateInvitationController,joinGroupWithInvitationController, revokeInvitationController};
