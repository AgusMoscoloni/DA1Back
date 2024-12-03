import jwt from 'jsonwebtoken'

import { sendErrorResponse } from '../utils/helper.js';


const validateToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization

    if(!authHeader){
        return sendErrorResponse({res, message: 'Unathorized', statusCode: 401})    
    }
    const token = authHeader.split(" ")[1]
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fran")
        console.log(decoded)
        req.user = decoded
        next();
    
    } catch (err) {
        console.error('Invalid JWT:', err);
        return sendErrorResponse({res, message: 'Unathorized', statusCode: 401})    
    }
};

const validateRefreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return sendErrorResponse({ res, message: 'Refresh token is required', statusCode: 400 });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refreshSecret");
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Invalid Refresh Token:', err);
        return sendErrorResponse({ res, message: 'Invalid or expired refresh token', statusCode: 403 });
    }
};

const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = {}; // Asigna un objeto vacío si no hay token
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "D=yAU>Ev(8A;NWl+?C*4=R'ptS(e:=Hj");
        console.log(decoded)
        // Asigna userId si existe, o un objeto vacío si no
        req.user = decoded.userId ? { userId: decoded.userId } : {};

        return next();
    } catch (error) {
        return sendErrorResponse(res, "Forbidden", "Invalid token", 403);
    }
};
export default { validateToken, validateRefreshToken };