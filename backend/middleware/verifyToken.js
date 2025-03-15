import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    try {
        if(!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log('Error in verify token: ', error);
        return res.status(401).json({ success: false, message: "Internal Server Error"});
    }
}