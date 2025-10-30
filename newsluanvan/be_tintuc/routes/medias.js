import express from 'express';
import db from '../db.js';

const router = express.Router();

// Thêm ảnh vào bảng medias
router.post('/', async (req, res) => {
  const { file_url, file_name, file_type, article_id } = req.body;
  try {
    await db.query(
      'INSERT INTO medias (file_url, file_name, file_type, article_id, upload_at) VALUES (?, ?, ?, ?, NOW())',
      [file_url, file_name, file_type, article_id]
    );
    res.json({ message: 'Lưu ảnh thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lưu ảnh!' });
  }
});

export default router;
