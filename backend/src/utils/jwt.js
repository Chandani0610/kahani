const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'kahani_secret_key_2026');
    } catch (error) {
        return null;
    }
};

const generateResetToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email, purpose: 'password_reset' },
        process.env.JWT_SECRET || 'kahani_secret_key_2026',
        { expiresIn: '15m' }
    );
};

const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kahani_secret_key_2026');
        if (decoded && decoded.purpose === 'password_reset') {
            return decoded;
        }
        return null;
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken, generateResetToken, verifyResetToken };