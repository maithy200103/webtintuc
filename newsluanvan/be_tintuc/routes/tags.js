import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tags');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy tags!' });
  }
});

// GET /api/tags/:tagName/articles
router.get('/:tagName/articles', async (req, res) => {
  const { tagName } = req.params;
  // Lấy tag
  const [tags] = await db.query('SELECT * FROM tags WHERE name = ?', [tagName]);
  if (tags.length === 0) return res.status(404).json({ error: 'Không tìm thấy tag' });
  const tag = tags[0];
  // Lấy các bài viết có tag này
  const [articles] = await db.query(
    `SELECT a.* FROM articles a
     JOIN articles_tags at ON a.id = at.article_id
     WHERE at.tag_id = ? AND a.status = 'published'
     ORDER BY a.published_at DESC`,
    [tag.id]
  );
  res.json({ tag, articles });
});

export default router;