const authService = require('../services/authService');
const register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;
        const result = await authService.registerUser(first_name, last_name, email, phone, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

const login= async(req,res)=> {
    try{
        const{email,phone,password}=req.body;
    const result=await authService.loginUser(email,phone,password);
    res.status(201).json(result);
    }catch(error){
        res.status(401).json({message:error.message});
    }
}

const getProfile = async(req,res)=> {
    try{
        const user = await authService.getUserById(req.user.id);
        res.status(200).json(user);
    }catch(error){
        res.status(404).json({message:error.message});
    }
}

const updateProfileController = async(req,res)=> {
    try{
        const user= await authService.updateProfile(req.user.id, req.body.first_name, req.body.last_name, req.body.email, req.body.phone);
        res.status(200).json(user);
    }catch(error){
        res.status(401).json({message:error.message});
    }
}

const updatePasswordController = async(req,res)=> {
    try{
        const user=await authService.updatePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        res.status(200).json(user);

    }catch(error){
        res.status(401).json({message:error.message});
    }
}

module.exports = { register, login, getProfile, updateProfileController, updatePasswordController };