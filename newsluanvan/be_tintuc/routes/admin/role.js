import express from 'express';
import db from '../../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM role');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách vai trò!' });
  }
});

export default router;


