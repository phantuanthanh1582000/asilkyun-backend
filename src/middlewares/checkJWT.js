const jwt = require('jsonwebtoken');
const userModel = require('../model/users'); // Đường dẫn tới model userModel

// Middleware kiểm tra và xác thực token JWT
const authenticateToken = (req, res, next) => {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Token sẽ được truyền theo định dạng "Bearer <token>"

    if (token == null) return res.status(401).send('Token không tồn tại');

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).send('Token không hợp lệ');

        // Thêm thông tin người dùng vào yêu cầu
        req.user = user;
        next(); // Tiếp tục đến route handler
    });
};

const checkAdmin = (req, res, next) => {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Token sẽ được truyền theo định dạng "Bearer <token>"

    if (token == null) return res.status(401).send('Token không tồn tại');

    jwt.verify(token, 'your_jwt_secret', async (err, user) => {
        if (err) return res.status(403).send('Token không hợp lệ');

        try {
            // Tìm người dùng dựa trên ID từ token
            const foundUser = await userModel.findById(user.userId);
            if (!foundUser) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            // Kiểm tra vai trò của người dùng
            if (foundUser.role !== 0) {
                return res.status(403).send('Bạn không có quyền truy cập');
            }

            // Thêm thông tin người dùng vào yêu cầu
            req.user = foundUser;
            next(); // Tiếp tục đến route handler
        } catch (err) {
            console.error(err);
            return res.status(500).send('Lỗi máy chủ nội bộ');
        }
    });
};

module.exports = { authenticateToken, checkAdmin }
