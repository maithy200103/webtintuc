import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = express.Router();



router.post('/', async (req, res) => {
  const { id, name, email, password, role } = req.body;
  console.log("🟢 Received:", name, email, password, role); // 🟢 Log 1
  try {
    // Validation cho mật khẩu
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }
    
    // Validation cho email
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập email!' });
    }
    
    // Validation cho tên
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập tên!' });
    }
    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Email đã tồn tại!' });
    }

    const [usersById] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (usersById.length > 0) {
      return res.status(400).json({ message: 'ID đã tồn tại!' });
    }

    const hash_pw = await bcrypt.hash(password, 10);
    console.log("🔐 Hashed password:", hash_pw); // 🟢 Log 2

    const [result] = await db.query(
      'INSERT INTO users (name, email, hash_pw, status, security_stamp) VALUES (?, ?, ?, 1, ?)',
      [name, email, hash_pw, Math.random().toString(36).substring(2, 10)]
    );
    const userId = result.insertId;
    console.log("✅ User inserted ID:", userId); // 🟢 Log 3

    const [roles] = await db.query('SELECT id FROM role WHERE name = ?', [role]);
    console.log("🛡️ Role result:", roles); // 🟢 Log 4

    if (roles.length === 0) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ!' });
    }

    const roleId = roles[0].id;

    await db.query(
      'INSERT INTO user_role (user_id, role_id, assigned_at) VALUES (?, ?, NOW())',
      [userId, roleId]
    );

    console.log("✅ User role assigned"); // 🟢 Log 5
    res.json({ 
      message: 'Tạo tài khoản thành công!',
      id: userId,
      name: name,
      email: email,
      role: role
    });
  } catch (err) {
    console.error("❌ Lỗi tại API /taotaikhoan:", err); // In lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Lấy danh sách tài khoản (có role)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.status, u.create_at, r.name AS role
      FROM users u
      LEFT JOIN user_role ur ON u.id = ur.user_id
      LEFT JOIN role r ON ur.role_id = r.id
      ORDER BY u.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài khoản!' });
  }
});

// Xóa người dùng
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  // Lấy id hiện tại từ header (hoặc token, hoặc body)
  const currentUserId = req.header('x-current-user-id');
  if (id == currentUserId) {
    return res.status(400).json({ message: 'Bạn không thể xóa chính mình' });
  }
  try {
    // Xóa các bảng liên quan theo thứ tự (từ con đến cha)
    // 1. Xóa comments của user
    await db.query('DELETE FROM comments WHERE user_id = ?', [id]);
    
    // 2. Xóa articles_views của user (nếu có)
    await db.query('DELETE FROM articles_views WHERE id_address = ?', [id]);
    
    // 3. Xóa articles_approvals của user
    await db.query('DELETE FROM articles_approvals WHERE user_id = ?', [id]);
    
    // 4. Xóa user_role của user
    await db.query('DELETE FROM user_role WHERE user_id = ?', [id]);
    
    // 5. Xóa articles của user (nếu có)
    await db.query('DELETE FROM articles WHERE author_id = ?', [id]);
    
    // 6. Cuối cùng mới xóa user
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    res.json({ message: 'Xóa người dùng thành công!' });
  } catch (err) {
    console.error('Lỗi xóa người dùng:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng!' });
  }
});

export default router;
