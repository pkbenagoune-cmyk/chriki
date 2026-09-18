// ============================================================
// CHRIKI - AUTHENTICATION MIDDLEWARE
// ============================================================

const jwt = require('jsonwebtoken');

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

const authenticateToken = (req, res, next) => {

    try {

        // ========================================================
        // VERIFIER JWT SECRET
        // ========================================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                message:
                    'Server authentication configuration error.'
            });
        }

        // ========================================================
        // RECUPERER LE TOKEN
        // ========================================================

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                message:
                    'Access token is missing'
            });
        }

        // ========================================================
        // VERIFIER LE FORMAT
        // ========================================================

        const parts =
            authHeader.split(' ');

        if (
            parts.length !== 2 ||
            parts[0] !== 'Bearer' ||
            !parts[1]
        ) {

            return res.status(401).json({
                message:
                    'Invalid authorization header format'
            });
        }

        const token = parts[1];

        // ========================================================
        // VERIFIER LE TOKEN
        // ========================================================

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (error, user) => {

                if (error) {

                    return res.status(401).json({
                        message:
                            'Invalid access token'
                    });
                }

                // ==================================================
                // STOCKER L'UTILISATEUR
                // ==================================================

                req.user = user;

                // ==================================================
                // CONTINUER
                // ==================================================

                next();
            }
        );

    } catch (error) {

        console.error(
            'Erreur authentication :',
            error
        );

        return res.status(500).json({
            message:
                'Authentication error.'
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = authenticateToken;