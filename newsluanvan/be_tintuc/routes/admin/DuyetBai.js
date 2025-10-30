import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Lấy danh sách bài viết chờ duyệt (hoặc tất cả bài viết)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id, a.title, a.content, a.published_at, a.status,
        u.name AS author
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'draft'
      ORDER BY a.published_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách bài viết:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài viết!' });
  }
});

// Duyệt bài (cập nhật status)
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE articles SET status = ? WHERE id = ?', ['published', id]);
    res.json({ message: 'Duyệt bài thành công!' });
  } catch (err) {
    console.error('Lỗi duyệt bài:', err);
    res.status(500).json({ message: 'Lỗi server khi duyệt bài!' });
  }
});

// Từ chối bài (cập nhật status và lưu comment)
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    // Cập nhật trạng thái bài viết
    await db.query('UPDATE articles SET status = ? WHERE id = ?', ['rejected', id]);
    // Cập nhật trạng thái duyệt bài và lưu comment
    await db.query('UPDATE articles_approvals SET status = ?, comment = ? WHERE articles_id = ?', ['rejected', reason, id]);
    res.json({ message: 'Từ chối bài thành công!' });
  } catch (err) {
    console.error('Lỗi từ chối bài:', err);
    res.status(500).json({ message: 'Lỗi server khi từ chối bài!' });
  }
});

export default router;
