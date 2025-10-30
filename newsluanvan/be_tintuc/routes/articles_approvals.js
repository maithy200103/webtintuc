import express from 'express';
import db from '../db.js';

const router = express.Router();

// Thêm bản ghi duyệt bài
router.post('/', async (req, res) => {
  const { articles_id, status, user_id } = req.body;
  if (!articles_id || !status) return res.status(400).json({ message: 'Thiếu thông tin!' });
  
  // Kiểm tra user_id
  if (!user_id) {
    return res.status(400).json({ message: 'Thiếu thông tin người dùng!' });
  }
  
  try {
    // Kiểm tra user có tồn tại không
    const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }
    
    await db.query(
      `INSERT INTO articles_approvals (articles_id, status, user_id) VALUES (?, ?, ?)`,
      [articles_id, status, user_id]
    );
    res.json({ message: 'Gửi duyệt bài thành công!' });
  } catch (err) {
    console.error('Lỗi gửi duyệt bài:', err);
    res.status(500).json({ message: 'Lỗi server khi gửi duyệt bài!' });
  }
});

export default router;
