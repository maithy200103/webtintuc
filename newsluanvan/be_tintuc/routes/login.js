import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db.js'; // Đảm bảo đường dẫn đúng

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Đổi thành biến môi trường khi deploy

// Middleware xác thực token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Hàm validation email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Vui lòng nhập email' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email không hợp lệ' };
  }
  if (email.length > 100) {
    return { isValid: false, message: 'Email quá dài' };
  }
  return { isValid: true };
}

// Hàm validation password
function validatePassword(password) {
  if (!password || !password.trim()) {
    return { isValid: false, message: 'Vui lòng nhập mật khẩu' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  if (password.length > 50) {
    return { isValid: false, message: 'Mật khẩu quá dài' };
  }
  
  // Kiểm tra ký tự đặc biệt không được phép
  const specialCharsRegex = /[<>\"'&]/;
  if (specialCharsRegex.test(password)) {
    return { isValid: false, message: 'Mật khẩu không được chứa ký tự đặc biệt: < > " \' &' };
  }
  
  return { isValid: true };
}

// Đăng nhập
router.post('/', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    // Validation email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }
    
    // Validation password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    // Lấy user theo email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    const user = users[0];

    // So sánh password hash
    const match = await bcrypt.compare(password, user.hash_pw);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    // Lấy role
    const [userRoles] = await db.query('SELECT * FROM user_role WHERE user_id = ?', [user.id]);
    if (userRoles.length === 0) return res.status(403).json({ message: 'Không có vai trò' });

    const roleId = userRoles[0].role_id;
    const [roles] = await db.query('SELECT * FROM role WHERE id = ?', [roleId]);
    const roleName = roles[0]?.name;

    // Nếu có truyền role từ client, kiểm tra user có đúng vai trò không
    if (role && roleName && roleName.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: 'Bạn không có vai trò này' });
    }

    // Tạo JWT
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: roleName }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin user từ token
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;