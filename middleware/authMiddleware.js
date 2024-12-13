const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    try {
        if (!authHeader) {
            return res.status(404).json({
                message : "토큰이 존재하지 않습니다."
            });
        }

        const decoded = jwt.verify(authHeader, process.env.P_K);
        req.user = decoded;
        next();

    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message : "토큰이 만료되었습니다."
            });
        }
        
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message : '토큰이 존재하지 않습니다.'
            });
        }
        res.status(500).json({
            message : "서버 에러가 발생하였습니다."
        });
    }
}