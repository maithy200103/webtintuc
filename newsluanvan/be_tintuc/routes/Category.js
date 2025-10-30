import express from 'express';
import db from '../db.js';


const router = express.Router();

// Lấy toàn bộ danh mục
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM category ORDER BY `order` ASC');
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh mục:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục!' });
  }
});

// Thêm danh mục mới
router.post('/', async (req, res) => {
  const { name, slug, order } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc!' });
  try {
    // Kiểm tra trùng tên (không phân biệt hoa thường, loại bỏ khoảng trắng)
    const [exist] = await db.query('SELECT * FROM category WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [name]);
    if (exist.length > 0) {
      return res.status(400).json({ message: 'Tên danh mục đã tồn tại!' });
    }
    const orderNum = Number.isInteger(order) ? order : parseInt(order) || 0;
    const [result] = await db.query(
      'INSERT INTO category (name, slug, `order`) VALUES (?, ?, ?)',
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), orderNum]
    );
    const [rows] = await db.query('SELECT * FROM category WHERE id = ?', [result.insertId]);
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    console.error('Lỗi thêm danh mục:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm danh mục!' });
  }
});

// Xóa danh mục
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Kiểm tra còn bài viết thuộc danh mục này không
    const [articles] = await db.query('SELECT id FROM articles WHERE category_id = ?', [id]);
    if (articles.length > 0) {
      return res.status(400).json({ message: 'Còn bài báo thuộc danh mục này.Bạn không thể xóa.' });
    }
    await db.query('DELETE FROM category WHERE id = ?', [id]);
    res.json({ message: 'Xóa danh mục thành công!' });
  } catch (err) {
    console.error('Lỗi xóa danh mục:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục!' });
  }
});

// Sửa danh mục
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, order } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc!' });
  try {
    const orderNum = Number.isInteger(order) ? order : parseInt(order) || 0;

    // Tìm danh mục đang có order mới (nếu có và khác id hiện tại)
    const [targetRows] = await db.query(
      'SELECT * FROM category WHERE `order` = ? AND id != ?',
      [orderNum, id]
    );

    if (targetRows.length > 0) {
      // Nếu có, hoán đổi order
      const targetCat = targetRows[0];
      // Lấy order hiện tại của danh mục đang sửa
      const [currentRows] = await db.query('SELECT `order` FROM category WHERE id = ?', [id]);
      const currentOrder = currentRows[0].order;

      // Cập nhật order cho danh mục đang sửa
      await db.query(
        'UPDATE category SET name = ?, slug = ?, `order` = ? WHERE id = ?',
        [name, slug || name.toLowerCase().replace(/\s+/g, '-'), orderNum, id]
      );
      // Cập nhật order cho danh mục bị trùng
      await db.query(
        'UPDATE category SET `order` = ? WHERE id = ?',
        [currentOrder, targetCat.id]
      );
    } else {
      // Nếu không trùng, chỉ cập nhật danh mục đang sửa
      await db.query(
        'UPDATE category SET name = ?, slug = ?, `order` = ? WHERE id = ?',
        [name, slug || name.toLowerCase().replace(/\s+/g, '-'), orderNum, id]
      );
    }
    const [rows] = await db.query('SELECT * FROM category WHERE id = ?', [id]);
    res.json({ category: rows[0] });
  } catch (err) {
    console.error('Lỗi sửa danh mục:', err);
    res.status(500).json({ message: 'Lỗi server khi sửa danh mục!' });
  }
});

// ExpressJS
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log('Slug nhận được:', slug);
  // Lấy thông tin category
  const [categories] = await db.query('SELECT * FROM category WHERE slug = ?', [slug]);
  if (categories.length === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  const category = categories[0];
  // Lấy các bài viết thuộc category
  const [articles] = await db.query(
    'SELECT * FROM articles WHERE category_id = ? AND status = "published" ORDER BY published_at DESC',
    [category.id]
  );
  res.json({ category, articles });
});

export default router;
