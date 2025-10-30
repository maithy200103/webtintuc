// import express from 'express';
// import db from './db.js';

// const app = express();

// app.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT NOW() AS time');
//     res.send(`Database connected! Server time: ${rows[0].time}`);
//   } catch (err) {
//     console.error('Database error:', err);
//     res.status(500).send('Database connection failed');
//   }
// });

// app.listen(3000, () => {
//   console.log('🚀 Server running at http://localhost:3000');
// });
//////////////////
import express from 'express';
import cors from 'cors';
import db from './db.js';
import articleRoutes from './routes/articles.js'; // Đảm bảo file này là .js, không phải .jsx
import loginRoutes from './routes/login.js';
import taotaikhoanRoutes from './routes/taotaikhoan.js';

import soanthaoRoutes from './routes/bientapvien/SoanThao.js';
import uploadRoutes from './routes/uploads.js';
import categoryRoutes from './routes/Category.js';
import duyetBaiRoutes from './routes/admin/DuyetBai.js';
import roleRouter from './routes/admin/role.js';

import userRoleRouter from './routes/admin/User_Role.js';
import articlesApprovalsRouter from './routes/articles_approvals.js';
import articlesViewsRouter from './routes/articles_views.js';
import mediasRouter from './routes/medias.js';
import tagsRouter from './routes/tags.js';
import commentsRouter from './routes/comments.js';
import searchRouter from './routes/search.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh uploads
app.use('/uploads', express.static('public/uploads'));

// Route bài viết
app.use('/api/articles', articleRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/taotaikhoan', taotaikhoanRoutes);
app.use('/api/soanthao',soanthaoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/duyetbai', duyetBaiRoutes);
app.use('/api/roles', roleRouter);
app.use('/api/user_role', userRoleRouter);
app.use('/api/articles_approvals', articlesApprovalsRouter);
app.use('/api/articles-views', articlesViewsRouter);
app.use('/api/medias', mediasRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/search', searchRouter);

// Kiểm tra kết nối DB
app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS time');
    res.send(`✅ Database connected! Server time: ${rows[0].time}`);
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).send('Database connection failed');
  }
});

// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
// });


// API cho bài viết
app.use('/api/articles', articleRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/taotaikhoan', taotaikhoanRoutes);
app.use('/api/soanthao',soanthaoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/duyetbai', duyetBaiRoutes);
app.use('/api/roles', roleRouter);
app.use('/api/user_role', userRoleRouter);
app.use('/api/articles_approvals', articlesApprovalsRouter);
app.use('/api/medias', mediasRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/search', searchRouter);
app.use('/api/articles-views', articlesViewsRouter);

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});