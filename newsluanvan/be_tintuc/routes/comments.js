import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
}

// Thêm bình luận mới (chỉ cho user đã đăng nhập)
router.post('/', authenticateToken, async (req, res) => {
  const { articles_id, content } = req.body;
  const user_id = req.user.id;

  if (!articles_id || !content) {
    return res.status(400).json({ error: 'Thiếu thông tin bình luận' });
  }

  try {
    const now = new Date();
    await db.query(
      'INSERT INTO comments (articles_id, user_id, content, create_at) VALUES (?, ?, ?, ?)',
      [articles_id, user_id, content, now]
    );
    res.json({ message: 'Bình luận đã được thêm thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi thêm bình luận' });
  }
});

// Lấy danh sách bình luận theo bài báo (không cần đăng nhập)
router.get('/article/:id', async (req, res) => {
  const articleId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name as user_name FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.articles_id = ?
       ORDER BY c.create_at DESC`,
      [articleId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy bình luận' });
  }
});

export default router;
