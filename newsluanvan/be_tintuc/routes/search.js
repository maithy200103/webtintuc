import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/search?q=keyword
router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Yêu cầu từ khóa tìm kiếm' });
  }

  try {
    const searchQuery = `%${q}%`;
    const [articles] = await db.query(
      `
      SELECT
        a.id,
        a.title,
        a.slug,
        a.image_url,
        a.published_at,
        c.name as category_name,
        c.slug as category_slug
      FROM articles a
      LEFT JOIN category c ON a.category_id = c.id
      WHERE (a.title LIKE ? OR a.content LIKE ?)
      AND a.status = 'published'
      ORDER BY a.published_at DESC
      `,
      [searchQuery, searchQuery]
    );

    res.json(articles);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm bài viết' });
  }
});

export default router;

