// Import các thư viện cần thiết
import express from 'express';
import multer from 'multer';
import db from '../../db.js';
import path from 'path';

// Cấu hình lưu trữ file upload với multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Đặt thư mục lưu file upload
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Đặt tên file upload là duy nhất (dựa vào timestamp và random)
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Route POST để soạn thảo bài viết mới
router.post('/', upload.single('thumbnail'), async (req, res) => {
  // Lấy dữ liệu từ body của request
  const { title, category, content, action, userId } = req.body;
  try {
    // Kiểm tra userId (bắt buộc phải có)
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId (người dùng chưa đăng nhập)' });
    }
  
    const author_id = parseInt(userId); // ID của biên tập viên
  
    // Thời gian đăng và tạo bài viết
    const published_at = new Date();
    const created_at = new Date();
    const source_id = 1; // Giả định nguồn mặc định là 1

    // Tạo slug từ tiêu đề bài viết
    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[ -\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Xử lý ảnh đại diện nếu có upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    // Xác định category_id: nếu là số thì giữ nguyên, nếu là slug thì truy vấn DB để lấy id
    let category_id = category;
    if (isNaN(category)) {
      const [catRows] = await db.query('SELECT id FROM category WHERE slug = ?', [category]);
      if (catRows.length > 0) category_id = catRows[0].id;
      else category_id = null;
    }

    // Luôn lưu bài viết vào bảng articles với trạng thái 'draft'
    const [result] = await db.query(
      `INSERT INTO articles 
        (title, slug, content, image_url, category_id, author_id, status, published_at, created_at, source_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content,
        image_url,
        category_id,
        author_id,
        'draft',
        published_at,
        created_at,
        source_id
      ]
    );
    const articleId = result.insertId; // Lấy id bài viết vừa tạo

    // Nếu action là 'submit', lưu vào bảng articles_approvals với trạng thái 'pending'
    if (action === 'submit') {
      await db.query(
        `INSERT INTO articles_approvals (articles_id, status, user_id) VALUES (?, 'pending', ?)`,
        [articleId, author_id] // author_id là id biên tập viên đang đăng nhập
      );
    }

    // Xử lý tags
    let tags = [];
    try {
      tags = JSON.parse(req.body.tags); // tags là mảng tên tag hoặc id tag
    } catch (e) {
      tags = [];
    }

    for (let tag of tags) {
      let tagId = tag;

      // Nếu tag là tên (không phải số), kiểm tra hoặc thêm mới
      if (isNaN(Number(tag))) {
        // Kiểm tra tag đã tồn tại chưa
        const [exist] = await db.query('SELECT id FROM tags WHERE name = ?', [tag]);
        if (exist.length > 0) {
          tagId = exist[0].id;
        } else {
          // Thêm mới tag
          const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [tag]);
          tagId = result.insertId;
        }
      }

      // Thêm vào bảng articles_tags nếu chưa có
      await db.query(
        'INSERT IGNORE INTO articles_tags (article_id, tag_id) VALUES (?, ?)',
        [articleId, tagId]
      );
    }

    // Trả về kết quả thành công
    res.status(201).json({ message: 'Thêm bài viết thành công!', id: articleId });
  } catch (err) {
    // Xử lý lỗi và trả về lỗi server
    console.error('Lỗi thêm bài viết:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm bài viết!', err: err.message });
  }
});

export default router;
