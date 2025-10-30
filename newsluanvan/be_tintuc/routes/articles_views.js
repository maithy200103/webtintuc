import express from 'express';
import mysql from 'mysql2/promise';
import db from '../db.js';

const router = express.Router();

// Lưu lượt xem bài báo
router.post('/record-view', async (req, res) => {
  try {
    const { articles_id, id_address } = req.body;
    
    if (!articles_id) {
      return res.status(400).json({ error: 'articles_id là bắt buộc' });
    }

    // Sử dụng connection pool thay vì tạo connection mới
    const [result] = await db.execute(
      'INSERT INTO articles_views (articles_id, id_address, viewd_at) VALUES (?, ?, NOW())',
      [articles_id, id_address || 'unknown']
    );

    res.json({ 
      success: true, 
      message: 'Đã lưu lượt xem thành công',
      view_id: result.insertId 
    });

  } catch (error) {
    console.error('Lỗi khi lưu lượt xem:', error);
    res.status(500).json({ error: 'Lỗi server khi lưu lượt xem' });
  }
});

// Lấy thống kê lượt xem theo ngày
router.get('/stats-by-date', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    console.log('Stats API - start_date:', start_date, 'end_date:', end_date);
    
    let query = `
      SELECT 
        DATE(viewd_at) as date,
        COUNT(*) as count
      FROM articles_views
    `;
    
    const params = [];
    
    if (start_date && end_date) {
      query += ' WHERE DATE(viewd_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' GROUP BY DATE(viewd_at) ORDER BY date DESC';
    
    console.log('Stats Query:', query);
    console.log('Stats Params:', params);
    
    const [rows] = await db.execute(query, params);
    console.log('Stats Result:', rows);
    
    res.json(rows);

  } catch (error) {
    console.error('Lỗi khi lấy thống kê lượt xem:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê' });
  }
});

// Lấy bài báo trending (có lượt xem nhiều nhất)
router.get('/trending', async (req, res) => {
  try {
    console.log('=== TRENDING API CALLED ===');
    const { limit = 10 } = req.query;
    console.log('Limit parameter:', limit);
    
    // Query để debug - lấy tất cả bài báo có lượt xem
    const query = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.image_url,
        a.author_id,
        u.name AS author,
        a.published_at,
        a.status,
        COUNT(av.id) as view_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      INNER JOIN articles_views av ON a.id = av.articles_id
      GROUP BY a.id
      ORDER BY view_count DESC, a.published_at DESC
      LIMIT ${parseInt(limit) || 3}
    `;
    
    console.log('Query:', query);
    const limitValue = parseInt(limit) || 3;
    console.log('Limit value:', limitValue);
    
    const [rows] = await db.query(query);
    
    console.log('Trending articles found:', rows.length);
    console.log('Trending data:', rows);
    
    res.json(rows);

  } catch (error) {
    console.error('=== TRENDING API ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Lỗi server khi lấy bài báo trending',
      details: error.message 
    });
  }
});

// Debug: Kiểm tra tất cả bài báo có status published
router.get('/debug-published', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.status,
        a.published_at,
        COUNT(av.id) as view_count
      FROM articles a
      LEFT JOIN articles_views av ON a.id = av.articles_id
      WHERE a.status = 'published'
      GROUP BY a.id
      ORDER BY a.published_at DESC
    `;
    
    const [rows] = await db.execute(query);
    console.log('Published articles found:', rows.length);
    console.log('Published articles data:', rows);
    res.json(rows);

  } catch (error) {
    console.error('Lỗi khi debug published articles:', error);
    res.status(500).json({ error: 'Lỗi server khi debug' });
  }
});

// Kiểm tra bài báo có tồn tại không
router.get('/check-articles', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.status,
        COUNT(av.id) as view_count
      FROM articles a
      LEFT JOIN articles_views av ON a.id = av.articles_id
      WHERE a.id IN (185, 153, 126, 181)
      GROUP BY a.id
    `;
    
    const [rows] = await db.execute(query);
    console.log('Articles check result:', rows);
    res.json(rows);

  } catch (error) {
    console.error('Lỗi khi kiểm tra bài báo:', error);
    res.status(500).json({ error: 'Lỗi server khi kiểm tra bài báo' });
  }
});

// Lấy tổng lượt xem của một bài báo
router.get('/article/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.execute(
      'SELECT COUNT(*) as view_count FROM articles_views WHERE articles_id = ?',
      [id]
    );
    
    res.json({ view_count: rows[0].view_count });

  } catch (error) {
    console.error('Lỗi khi lấy lượt xem bài báo:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy lượt xem' });
  }
});

export default router;
