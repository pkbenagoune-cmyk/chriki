const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const registerUser = async (first_name, last_name, email, phone,password) => {
    if (!email&&!phone){
        throw new Error("Email or phone are required");
    }
    const verifycoordinate = await pool.query(
        "SELECT * FROM users WHERE email = $1 OR phone = $2",
        [email, phone]
    );
    if (verifycoordinate.rows.length > 0) {
        throw new Error("Email or phone already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        "INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, phone, created_at",
        [first_name, last_name, email, phone, hashedPassword]
    );
    const token = jwt.sign({id: result.rows[0].id, email: result.rows[0].email, phone: result.rows[0].phone}, process.env.JWT_SECRET, { expiresIn: '1h' });
    return {
        user :{
            id: result.rows[0].id,
            first_name: result.rows[0].first_name,
            last_name: result.rows[0].last_name,
            email: result.rows[0].email,
            phone: result.rows[0].phone,
            created_at: result.rows[0].created_at
        },
        token: token

        };

    
    
}

const loginUser = async(email,phone,password)=> {
    const searchuser = await pool.query(
        "SELECT * FROM users WHERE email=$1 OR phone=$2",
        [email, phone]
    );
    if(searchuser.rows.length === 0){
        throw new Error("User not found");
    }
    const user = searchuser.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error("User not found");
    }
    const token = jwt.sign({ id: user.id, email: user.email, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return {
    user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
    },
    token: token
};   
    
}

const updateProfile = async (userId, first_name, last_name, email, phone) => {
    const updateUser = await pool.query(
        `UPDATE users SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone)
        WHERE id = $5
        RETURNING id, first_name, last_name, email, phone, created_at`,
        [first_name, last_name, email, phone, userId]
    );
    return updateUser.rows[0];
}

const updatePassword = async(userId, oldPassword, newPassword)=> {
    const bach = await pool.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
    );
    if(bach.rows.length === 0){
        throw new Error("User not found");
    }
    const user = bach.rows[0];
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isPasswordValid) {
        throw new Error("Old password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUser = await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, phone, created_at`,
        [hashedPassword, userId]
    );
    return updateUser.rows[0];
    
}

const getUserById = async (userId) => {
    const result = await pool.query(
        "SELECT id,first_name,last_name,email,phone,created_at FROM users WHERE id = $1",
        [userId]
    );
    if (result.rows.length === 0) {
        throw new Error("User not found");
    }
    return result.rows[0];
}
    
module.exports = { registerUser, loginUser, updateProfile, updatePassword, getUserById };