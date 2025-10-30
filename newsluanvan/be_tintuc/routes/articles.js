// import express from 'express';
// import db from '../db.js';

// const router = express.Router();

// // Hàm lấy tất cả bài viết (không lọc status)
// async function getAllArticles() {
//   const [rows] = await db.query(`
//     SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
//            a.author_id, -- thêm dòng này
//            u.name AS author,
//            c.name AS category
//     FROM articles a
//     LEFT JOIN users u ON a.author_id = u.id
//     LEFT JOIN category c ON a.category_id = c.id
//     ORDER BY a.published_at DESC
//   `);
//   return rows;
// }

// // Hàm lấy bài viết theo status
// async function getArticlesByStatus(status) {
//   const [rows] = await db.query(`
//     SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
//            a.author_id, -- thêm dòng này
//            u.name AS author,
//            c.name AS category
//     FROM articles a
//     LEFT JOIN users u ON a.author_id = u.id
//     LEFT JOIN category c ON a.category_id = c.id
//     WHERE a.status = ?
//     ORDER BY a.published_at DESC
//   `, [status]);
//   return rows;
// }

// // Hàm lấy bài viết theo category_id (loại trừ 1 id nếu cần)
// async function getArticlesByCategory(category_id, exclude_id = null, limit = 3) {
//   let sql = `
//     SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
//            a.author_id, -- thêm dòng này
//            u.name AS author,
//            c.name AS category, a.category_id
//     FROM articles a
//     LEFT JOIN users u ON a.author_id = u.id
//     LEFT JOIN category c ON a.category_id = c.id
//     WHERE a.category_id = ?
//   `;
//   const params = [category_id];
//   if (exclude_id) {
//     sql += ' AND a.id != ?';
//     params.push(exclude_id);
//   }
//   sql += ' ORDER BY a.published_at DESC LIMIT ?';
//   params.push(Number(limit));
//   const [rows] = await db.query(sql, params);
//   return rows;
// }

// // GET /api/articles — Lấy tất cả bài viết hoặc lọc theo status nếu có query param
// router.get('/', async (req, res) => {
//   try {
//     const { status } = req.query;
//     let rows;
//     if (status) {
//       rows = await getArticlesByStatus(status);
//     } else {
//       rows = await getAllArticles();
//     }
//     res.json(rows);
//   } catch (err) {
//     console.error('❌ Lỗi khi lấy danh sách bài viết:', err);
//     res.status(500).json({ error: 'Lỗi khi lấy danh sách bài viết' });
//   }
// });

// // GET /api/articles/:id — Lấy chi tiết 1 bài viết theo ID
// router.get('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [rows] = await db.query(
//       `SELECT a.*, c.name as category, a.category_id
//        FROM articles a
//        LEFT JOIN category c ON a.category_id = c.id
//        WHERE a.id = ? AND a.status = 'published'`,
//       [id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Không tìm thấy bài viết' });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// });

// // Sửa bài viết
// router.put('/:id', async (req, res) => {
//   const { id } = req.params;
//   const { title, content, category_id, status } = req.body;
//   try {
//     await db.query('UPDATE articles SET title = ?, content = ?, category_id = ?, status = ? WHERE id = ?', [title, content, category_id, status, id]);
//     res.json({ message: 'Cập nhật thành công!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết!' });
//   }
// });

// // Xóa bài viết
// router.delete('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     // 1. Xóa ở bảng articles_approvals trước (vì có foreign key reference)
//     await db.query('DELETE FROM articles_approvals WHERE articles_id = ?', [id]);
    
//     // 2. Sau đó mới xóa ở bảng articles
//     await db.query('DELETE FROM articles WHERE id = ?', [id]);
    
//     res.json({ message: 'Xóa thành công!' });
//   } catch (err) {
//     console.error('Lỗi xóa bài viết:', err);
//     res.status(500).json({ message: 'Lỗi server khi xóa bài viết!' });
//   }
// });

// // Route: GET /api/articles/category/:category_id
// router.get('/category/:category_id', async (req, res) => {
//   const { category_id } = req.params;
//   const { exclude_id, limit } = req.query;
//   try {
//     const rows = await getArticlesByCategory(category_id, exclude_id, limit || 3);
//     res.json(rows);
//   } catch (err) {
//     console.error('❌ Lỗi khi lấy bài viết theo danh mục:', err);
//     res.status(500).json({ error: 'Lỗi khi lấy bài viết theo danh mục' });
//   }
// });

// router.post('/:id/approve', async (req, res) => {
//   const { id } = req.params;
//   const { title, content } = req.body;
//   try {
//     // Cập nhật lại bài viết (nếu có chỉnh sửa)
//     await db.query('UPDATE articles SET title = ?, content = ?, status = ? WHERE id = ?', [title, content, 'pending', id]);
//     // Thêm vào bảng articles_approvals
//     await db.query('INSERT INTO articles_approvals (articles_id, status) VALUES (?, ?)', [id, 'pending']);
//     res.json({ message: 'Gửi duyệt thành công!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi server khi gửi duyệt!' });
//   }
// });

// export default router;





import express from 'express';
import db from '../db.js';

const router = express.Router();

// Hàm lấy tất cả bài viết (không lọc status)
async function getAllArticles() {
  const [rows] = await db.query(`
    SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
           a.author_id, a.category_id,
           u.name AS author,
           c.name AS category
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN category c ON a.category_id = c.id
    ORDER BY a.published_at DESC
  `);
  return rows;
}

// Hàm lấy bài viết theo status
async function getArticlesByStatus(status) {
  const [rows] = await db.query(`
    SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
           a.author_id, a.created_at, a.category_id,
           u.name AS author,
           c.name AS category
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN category c ON a.category_id = c.id
    WHERE a.status = ?
    ORDER BY a.created_at DESC
  `, [status]);
  return rows;
}

// Hàm lấy bài viết theo category_id (loại trừ 1 id nếu cần)
async function getArticlesByCategory(category_id, exclude_id = null, limit = 3) {
  let sql = `
    SELECT a.id, a.title, a.slug, a.content, a.image_url, a.published_at, a.status,
           a.author_id, -- thêm dòng này
           u.name AS author,
           c.name AS category, a.category_id
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN category c ON a.category_id = c.id
    WHERE a.category_id = ?
  `;
  const params = [category_id];
  if (exclude_id) {
    sql += ' AND a.id != ?';
    params.push(exclude_id);
  }
  sql += ' ORDER BY a.published_at DESC LIMIT ?';
  params.push(Number(limit));
  const [rows] = await db.query(sql, params);
  return rows;
}

// GET /api/articles — Lấy tất cả bài viết hoặc lọc theo status nếu có query param
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let rows;
    if (status) {
      rows = await getArticlesByStatus(status);
    } else {
      rows = await getAllArticles();
    }
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách bài viết:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bài viết' });
  }
});



// GET /api/articles/:id/tags
router.get('/:id/tags', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.name FROM articles_tags at
       JOIN tags t ON at.tag_id = t.id
       WHERE at.article_id = ?`, [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy tags của bài báo' });
  }
});



// GET /api/articles/:id — Lấy chi tiết 1 bài viết theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT a.*, c.name as category, a.category_id
       FROM articles a
       LEFT JOIN category c ON a.category_id = c.id
       WHERE a.id = ? AND a.status = 'published'`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    }
    // Xử lý đường dẫn ảnh
    const article = rows[0];
    if (article.image_url) {
// Nếu image_url là đường dẫn tương đối, thêm host
      if (!article.image_url.startsWith('http')) {
        article.image_url = `http://localhost:3000${article.image_url.startsWith('/') ? '' : '/'}${article.image_url}`;
      }
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Sửa bài viết
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, category_id, status } = req.body;
  try {
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    updateValues.push(id);
    
    const query = `UPDATE articles SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(query, updateValues);
    
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error('Lỗi cập nhật bài viết:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết!' });
  }
});

// Xóa bài viết
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Xóa ở bảng articles_approvals trước (vì có foreign key reference)
    await db.query('DELETE FROM articles_approvals WHERE articles_id = ?', [id]);
    
    // 2. Sau đó mới xóa ở bảng articles
    await db.query('DELETE FROM articles WHERE id = ?', [id]);
    
    res.json({ message: 'Xóa thành công!' });
  } catch (err) {
    console.error('Lỗi xóa bài viết:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa bài viết!' });
  }
});

// Route: GET /api/articles/category/:category_id
router.get('/category/:category_id', async (req, res) => {
  const { category_id } = req.params;
  const { exclude_id, limit } = req.query;
  try {
    const rows = await getArticlesByCategory(category_id, exclude_id, limit || 3);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi khi lấy bài viết theo danh mục:', err);
    res.status(500).json({ error: 'Lỗi khi lấy bài viết theo danh mục' });
  }
});

router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    // Cập nhật lại bài viết (nếu có chỉnh sửa)
    await db.query('UPDATE articles SET title = ?, content = ?, status = ? WHERE id = ?', [title, content, 'pending', id]);
    // Thêm vào bảng articles_approvals
    await db.query('INSERT INTO articles_approvals (articles_id, status) VALUES (?, ?)', [id, 'pending']);
    res.json({ message: 'Gửi duyệt thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi gửi duyệt!' });
  }
});



export default router;