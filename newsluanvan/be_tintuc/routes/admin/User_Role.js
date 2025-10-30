import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Lấy vai trò của user
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: 'Thiếu user_id' });
  try {
    const [rows] = await db.query(
      `SELECT ur.role_id, r.name as role_name
       FROM user_role ur
       JOIN role r ON ur.role_id = r.id
       WHERE ur.user_id = ?`, [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy vai trò user!' });
  }
});

// Thêm vai trò cho user
router.post('/', async (req, res) => {
  const { user_id, role_id } = req.body;
  if (!user_id || !role_id) return res.status(400).json({ message: 'Thiếu user_id hoặc role_id' });
  try {
    // Kiểm tra đã có chưa
    const [exist] = await db.query('SELECT * FROM user_role WHERE user_id = ? AND role_id = ?', [user_id, role_id]);
    if (exist.length > 0) return res.status(400).json({ message: 'User đã có vai trò này!' });

    await db.query('INSERT INTO user_role (user_id, role_id, assigned_at) VALUES (?, ?, NOW())', [user_id, role_id]);
    res.json({ message: 'Thêm vai trò thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi thêm vai trò!' });
  }
});

// Xóa vai trò khỏi user
router.delete('/', async (req, res) => {
  const { user_id, role_id } = req.body;
  if (!user_id || !role_id) return res.status(400).json({ message: 'Thiếu user_id hoặc role_id' });
  try {
    // Kiểm tra user có tồn tại không
    const [userCheck] = await db.query('SELECT name FROM users WHERE id = ?', [user_id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }
    
    // Kiểm tra vai trò có tồn tại không
    const [roleCheck] = await db.query('SELECT r.name FROM role r WHERE r.id = ?', [role_id]);
    if (roleCheck.length === 0) {
      return res.status(404).json({ message: 'Vai trò không tồn tại!' });
    }
    
    // Kiểm tra user có vai trò này không
    const [userRoleCheck] = await db.query('SELECT * FROM user_role WHERE user_id = ? AND role_id = ?', [user_id, role_id]);
    if (userRoleCheck.length === 0) {
      return res.status(404).json({ message: 'Người dùng không có vai trò này!' });
    }
    
    const userName = userCheck[0].name;
    const roleName = roleCheck[0].name;
    
    // Xóa vai trò
    await db.query('DELETE FROM user_role WHERE user_id = ? AND role_id = ?', [user_id, role_id]);
    
    res.json({ 
      message: `Đã xóa vai trò "${roleName}" khỏi người dùng "${userName}" thành công!`,
      user_name: userName,
      role_name: roleName
    });
  } catch (err) {
    console.error('Lỗi xóa vai trò:', err);
    res.status(500).json({ 
      message: 'Lỗi server khi xóa vai trò!',
      details: err.message 
    });
  }
});

export default router;
