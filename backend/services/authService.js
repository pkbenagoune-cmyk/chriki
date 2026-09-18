const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================================================
// REGISTER USER
// ============================================================

const registerUser = async (
    first_name,
    last_name,
    email,
    phone,
    password
) => {

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!first_name || !first_name.trim()) {
        throw new Error('First name is required');
    }

    if (!last_name || !last_name.trim()) {
        throw new Error('Last name is required');
    }

    if (!password || password.length < 6) {
        throw new Error(
            'Password must contain at least 6 characters'
        );
    }

    if (!email && !phone) {
        throw new Error(
            'Email or phone is required'
        );
    }

    // ========================================================
    // NORMALISATION
    // ========================================================

    const normalizedEmail = email
        ? email.trim().toLowerCase()
        : null;

    const normalizedPhone = phone
        ? phone.trim()
        : null;

    // ========================================================
    // VERIFIER SI L'EMAIL EXISTE
    // ========================================================

    if (normalizedEmail) {

        const existingEmail = await pool.query(
            `SELECT id
             FROM users
             WHERE email = $1
             LIMIT 1`,
            [normalizedEmail]
        );

        if (existingEmail.rows.length > 0) {
            throw new Error(
                'Email or phone already exists'
            );
        }
    }

    // ========================================================
    // VERIFIER SI LE TELEPHONE EXISTE
    // ========================================================

    if (normalizedPhone) {

        const existingPhone = await pool.query(
            `SELECT id
             FROM users
             WHERE phone = $1
             LIMIT 1`,
            [normalizedPhone]
        );

        if (existingPhone.rows.length > 0) {
            throw new Error(
                'Email or phone already exists'
            );
        }
    }

    // ========================================================
    // HASHER LE MOT DE PASSE
    // ========================================================

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    // ========================================================
    // CREER L'UTILISATEUR
    // ========================================================

    const result = await pool.query(
        `INSERT INTO users (
            first_name,
            last_name,
            email,
            phone,
            password_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at`,
        [
            first_name.trim(),
            last_name.trim(),
            normalizedEmail,
            normalizedPhone,
            hashedPassword
        ]
    );

    const user = result.rows[0];

    // ========================================================
    // VERIFIER JWT_SECRET
    // ========================================================

    if (!process.env.JWT_SECRET) {
        throw new Error(
            'JWT_SECRET is not configured'
        );
    }

    // ========================================================
    // GENERER LE TOKEN
    // ========================================================

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            phone: user.phone
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );

    // ========================================================
    // RETOUR
    // ========================================================

    return {
        user,
        token
    };
};

// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async (
    email,
    phone,
    password
) => {

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!password) {
        throw new Error('Password is required');
    }

    if (!email && !phone) {
        throw new Error(
            'Email or phone is required'
        );
    }

    // ========================================================
    // NORMALISATION
    // ========================================================

    const normalizedEmail = email
        ? email.trim().toLowerCase()
        : null;

    const normalizedPhone = phone
        ? phone.trim()
        : null;

    // ========================================================
    // RECHERCHE PAR EMAIL
    // ========================================================

    let result;

    if (normalizedEmail) {

        result = await pool.query(
            `SELECT *
             FROM users
             WHERE email = $1
             LIMIT 1`,
            [normalizedEmail]
        );

    } else {

        // ====================================================
        // RECHERCHE PAR TELEPHONE
        // ====================================================

        result = await pool.query(
            `SELECT *
             FROM users
             WHERE phone = $1
             LIMIT 1`,
            [normalizedPhone]
        );
    }

    // ========================================================
    // VERIFIER LES IDENTIFIANTS
    // ========================================================

    if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // ========================================================
    // VERIFIER LE MOT DE PASSE
    // ========================================================

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // ========================================================
    // VERIFIER JWT_SECRET
    // ========================================================

    if (!process.env.JWT_SECRET) {
        throw new Error(
            'JWT_SECRET is not configured'
        );
    }

    // ========================================================
    // GENERER LE TOKEN
    // ========================================================

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            phone: user.phone
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );

    // ========================================================
    // RETOUR
    // ========================================================

    return {
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            created_at: user.created_at
        },
        token
    };
};
// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfile = async (
    userId,
    first_name,
    last_name,
    email,
    phone
) => {
    const normalizedEmail = email
        ? email.trim().toLowerCase()
        : null;

    const normalizedPhone = phone
        ? phone.trim()
        : null;

    // Vérifier que l'email/téléphone n'appartient
    // pas à un autre utilisateur
    if (normalizedEmail || normalizedPhone) {
        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE (
                    ($1 IS NOT NULL AND email = $1)
                    OR
                    ($2 IS NOT NULL AND phone = $2)
                   )
               AND id != $3
             LIMIT 1`,
            [
                normalizedEmail,
                normalizedPhone,
                userId
            ]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('Email or phone already exists');
        }
    }

    const result = await pool.query(
        `UPDATE users
         SET
            first_name = COALESCE(NULLIF($1, ''), first_name),
            last_name = COALESCE(NULLIF($2, ''), last_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            updated_at`,
        [
            first_name ? first_name.trim() : null,
            last_name ? last_name.trim() : null,
            normalizedEmail,
            normalizedPhone,
            userId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
};


// ============================================================
// UPDATE PASSWORD
// ============================================================

const updatePassword = async (
    userId,
    oldPassword,
    newPassword
) => {
    if (!oldPassword || !newPassword) {
        throw new Error('Old password and new password are required');
    }

    if (newPassword.length < 6) {
        throw new Error(
            'New password must contain at least 6 characters'
        );
    }

    const result = await pool.query(
        `SELECT password_hash
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    const user = result.rows[0];

    // Vérifier ancien mot de passe
    const isPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error('Old password is incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    const updateResult = await pool.query(
        `UPDATE users
         SET
            password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            updated_at`,
        [
            hashedPassword,
            userId
        ]
    );

    return updateResult.rows[0];
};


// ============================================================
// GET USER BY ID
// ============================================================

const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_picture,
            created_at,
            updated_at
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    updatePassword,
    getUserById
};